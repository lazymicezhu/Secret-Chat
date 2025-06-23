// 聊天服务
const chatService = {
    currentChatId: null,
    currentRecipient: null,
    unsubscribeList: [],
    
    // 创建或获取聊天
    async createOrGetChat(userId1, userId2) {
        try {
            // 确保用户ID按字母顺序排序，以保证聊天ID的一致性
            // 但如果是管理员ID，则固定放在第二位
            const isAdmin = userId1 === 'admin' || userId2 === 'admin';
            const sortedIds = isAdmin 
                ? [userId1 === 'admin' ? userId2 : userId1, 'admin']
                : [userId1, userId2].sort();
            
            // 检查是否已存在聊天
            const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
            const chatDoc = await db.collection(COLLECTIONS.CHATS).doc(chatId).get();
            
            if (!chatDoc.exists) {
                // 创建新聊天
                await db.collection(COLLECTIONS.CHATS).doc(chatId).set({
                    participants: sortedIds,
                    createdAt: generateTimestamp(),
                    updatedAt: generateTimestamp()
                });
            }
            
            return chatId;
        } catch (error) {
            console.error('创建或获取聊天失败:', error);
            throw error;
        }
    },
    
    // 设置当前聊天
    setCurrentChat(chatId, recipient) {
        this.currentChatId = chatId;
        this.currentRecipient = recipient;
    },
    
    // 获取当前聊天ID
    getCurrentChatId() {
        return this.currentChatId;
    },
    
    // 获取当前聊天对象
    getCurrentRecipient() {
        return this.currentRecipient;
    },
    
    // 发送消息
    async sendMessage(chatId, senderId, content) {
        try {
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
            
            return message;
        } catch (error) {
            console.error('发送消息失败:', error);
            throw error;
        }
    },
    
    // 监听聊天消息
    listenToChatMessages(chatId, callback) {
        // 取消之前的监听
        this.unsubscribeAll();
        
        // 设置新的监听
        const unsubscribe = db.collection(COLLECTIONS.MESSAGES)
            .where('chatId', '==', chatId)
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(messages);
            });
        
        // 添加到取消订阅列表
        this.unsubscribeList.push(unsubscribe);
    },
    
    // 监听在线用户
    listenToOnlineUsers(callback) {
        const unsubscribe = db.collection(COLLECTIONS.USERS)
            .where('status', '==', STATUS.ONLINE)
            .onSnapshot(snapshot => {
                const users = [];
                snapshot.forEach(doc => {
                    users.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(users);
            });
        
        this.unsubscribeList.push(unsubscribe);
    },
    
    // 查找用户
    async findUserByUsername(username) {
        try {
            const snapshot = await db.collection(COLLECTIONS.USERS)
                .where('username', '==', username)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('查找用户失败:', error);
            throw error;
        }
    },
    
    // 添加取消订阅函数
    addUnsubscribe(unsubscribe) {
        this.unsubscribeList.push(unsubscribe);
    },
    
    // 取消所有订阅
    unsubscribeAll() {
        this.unsubscribeList.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.unsubscribeList = [];
    }
}; 