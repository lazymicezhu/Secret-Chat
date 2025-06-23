// 聊天系统功能
class ChatService {
    constructor() {
        this.currentChatId = null;
        this.currentRecipient = null;
        this.messageListeners = [];
        this.onlineUsersListener = null;
    }
    
    // 获取在线用户列表
    async getOnlineUsers() {
        try {
            const snapshot = await db.collection(COLLECTIONS.USERS)
                .where('status', '==', STATUS.ONLINE)
                .get();
            
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    username: data.username,
                    status: data.status,
                    lastSeen: data.lastSeen
                };
            });
        } catch (error) {
            handleError(error);
            return [];
        }
    }
    
    // 通过用户名查找用户
    async findUserByUsername(username) {
        try {
            const snapshot = await db.collection(COLLECTIONS.USERS)
                .where('username', '==', username)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            const data = doc.data();
            
            return {
                id: doc.id,
                username: data.username,
                status: data.status,
                lastSeen: data.lastSeen
            };
        } catch (error) {
            handleError(error);
            return null;
        }
    }
    
    // 创建或获取聊天
    async createOrGetChat(currentUserId, recipientId) {
        try {
            // 检查是否已存在聊天
            const existingChat = await db.collection(COLLECTIONS.CHATS)
                .where('participants', 'array-contains', currentUserId)
                .get();
            
            let chatId = null;
            
            // 查找包含两个用户的聊天
            for (const doc of existingChat.docs) {
                const participants = doc.data().participants;
                if (participants.includes(recipientId)) {
                    chatId = doc.id;
                    break;
                }
            }
            
            // 如果不存在，创建新聊天
            if (!chatId) {
                const chatRef = await db.collection(COLLECTIONS.CHATS).add({
                    participants: [currentUserId, recipientId],
                    createdAt: generateTimestamp(),
                    updatedAt: generateTimestamp()
                });
                
                chatId = chatRef.id;
            }
            
            return chatId;
            
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
    
    // 发送消息
    async sendMessage(chatId, senderId, content) {
        try {
            if (!content || content.trim() === '') {
                throw new Error('消息不能为空');
            }
            
            // 创建消息
            const message = {
                chatId: chatId,
                senderId: senderId,
                content: content,
                timestamp: generateTimestamp(),
                read: false
            };
            
            // 保存消息
            await db.collection(COLLECTIONS.MESSAGES).add(message);
            
            // 更新聊天的最后更新时间
            await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
                updatedAt: generateTimestamp()
            });
            
            // 滚动到最新消息
            this.scrollToBottom();
            
        } catch (error) {
            handleError(error);
            throw error;
        }
    }
    
    // 获取聊天消息
    async getChatMessages(chatId) {
        try {
            const snapshot = await db.collection(COLLECTIONS.MESSAGES)
                .where('chatId', '==', chatId)
                .orderBy('timestamp', 'asc')
                .get();
            
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    senderId: data.senderId,
                    content: data.content,
                    timestamp: data.timestamp,
                    read: data.read
                };
            });
        } catch (error) {
            handleError(error);
            return [];
        }
    }
    
    // 监听聊天消息
    listenToChatMessages(chatId, callback) {
        // 移除之前的监听器
        this.unsubscribeMessageListeners();
        
        // 添加新的监听器
        const unsubscribe = db.collection(COLLECTIONS.MESSAGES)
            .where('chatId', '==', chatId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const messages = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    messages.push({
                        id: doc.id,
                        senderId: data.senderId,
                        content: data.content,
                        timestamp: data.timestamp,
                        read: data.read
                    });
                });
                
                callback(messages);
                
                // 当有新消息时，滚动到底部
                if (snapshot.docChanges().some(change => change.type === 'added')) {
                    setTimeout(() => this.scrollToBottom(), 100);
                }
            }, error => {
                handleError(error);
            });
        
        this.messageListeners.push(unsubscribe);
    }
    
    // 滚动到最新消息
    scrollToBottom() {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // 监听在线用户
    listenToOnlineUsers(callback) {
        // 移除之前的监听器
        if (this.onlineUsersListener) {
            this.onlineUsersListener();
            this.onlineUsersListener = null;
        }
        
        // 添加新的监听器
        this.onlineUsersListener = db.collection(COLLECTIONS.USERS)
            .onSnapshot(snapshot => {
                const users = [];
                
                // 查找是否已有管理员
                let hasAdmin = false;
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.username === '管理员') {
                        hasAdmin = true;
                    }
                    users.push({
                        id: doc.id,
                        username: data.username,
                        status: data.status,
                        lastSeen: data.lastSeen,
                        isAdmin: data.isAdmin || false
                    });
                });
                
                // 如果没有找到管理员用户，添加一个虚拟的管理员用户
                if (!hasAdmin) {
                    users.push({
                        id: 'admin',
                        username: '管理员',
                        status: STATUS.ONLINE,
                        isAdmin: true
                    });
                }
                
                callback(users);
            }, error => {
                handleError(error);
            });
    }
    
    // 设置当前聊天
    setCurrentChat(chatId, recipient) {
        this.currentChatId = chatId;
        this.currentRecipient = recipient;
        
        // 设置聊天后滚动到底部
        setTimeout(() => this.scrollToBottom(), 100);
    }
    
    // 获取当前聊天ID
    getCurrentChatId() {
        return this.currentChatId;
    }
    
    // 获取当前聊天对象
    getCurrentRecipient() {
        return this.currentRecipient;
    }
    
    // 取消订阅消息监听器
    unsubscribeMessageListeners() {
        this.messageListeners.forEach(unsubscribe => unsubscribe());
        this.messageListeners = [];
    }
    
    // 添加取消订阅函数
    addUnsubscribe(unsubscribe) {
        this.messageListeners.push(unsubscribe);
    }
    
    // 取消所有订阅
    unsubscribeAll() {
        this.unsubscribeMessageListeners();
        
        if (this.onlineUsersListener) {
            this.onlineUsersListener();
            this.onlineUsersListener = null;
        }
    }
}

// 创建聊天服务实例
const chatService = new ChatService(); 