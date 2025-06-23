// 管理员功能相关代码
document.addEventListener('DOMContentLoaded', () => {
    // 管理员账户信息
    const ADMIN_CREDENTIALS = {
        username: 'Lazymice',
        password: 'zxb13424020019'
    };

    // DOM元素
    const adminLoginContainer = document.getElementById('admin-login-container');
    const adminPanelContainer = document.getElementById('admin-panel-container');
    const adminUsername = document.getElementById('admin-username');
    const adminPassword = document.getElementById('admin-password');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    
    // 统计数据元素
    const totalUsersElement = document.getElementById('total-users');
    const onlineUsersCountElement = document.getElementById('online-users-count');
    const totalMessagesElement = document.getElementById('total-messages');
    
    // 标签切换
    const tabUsers = document.getElementById('tab-users');
    const tabMessages = document.getElementById('tab-messages');
    const tabChat = document.getElementById('tab-chat');
    const panelUsers = document.getElementById('panel-users');
    const panelMessages = document.getElementById('panel-messages');
    const panelChat = document.getElementById('panel-chat');
    
    // 表格和筛选
    const usersTbody = document.getElementById('users-tbody');
    const messagesTbody = document.getElementById('messages-tbody');
    const searchUsers = document.getElementById('search-users');
    const filterUser = document.getElementById('filter-user');
    const filterDateStart = document.getElementById('filter-date-start');
    const filterDateEnd = document.getElementById('filter-date-end');
    const applyFiltersBtn = document.getElementById('apply-filters');

    // 数据存储
    let allUsers = [];
    let allMessages = [];
    let usernameMap = {}; // 用户ID到用户名的映射

    // 初始化管理员面板
    initAdmin();

    // 初始化函数
    function initAdmin() {
        console.log('初始化管理员面板...');
        
        // 检查DOM元素是否存在
        if (!adminLoginContainer) console.error('找不到adminLoginContainer元素');
        if (!adminPanelContainer) console.error('找不到adminPanelContainer元素');
        if (!adminUsername) console.error('找不到adminUsername元素');
        if (!adminPassword) console.error('找不到adminPassword元素');
        if (!adminLoginBtn) console.error('找不到adminLoginBtn元素');
        if (!adminLogoutBtn) console.error('找不到adminLogoutBtn元素');
        
        // 检查用户消息相关元素
        const tabUserMessages = document.getElementById('tab-user-messages');
        const panelUserMessages = document.getElementById('panel-user-messages');
        const userMessagesTbody = document.getElementById('user-messages-tbody');
        
        if (!tabUserMessages) console.error('找不到tab-user-messages元素');
        if (!panelUserMessages) console.error('找不到panel-user-messages元素');
        if (!userMessagesTbody) console.error('找不到user-messages-tbody元素');
        
        // 设置事件监听
        adminLoginBtn.addEventListener('click', handleAdminLogin);
        adminLogoutBtn.addEventListener('click', handleAdminLogout);
        tabUsers.addEventListener('click', () => switchTab('users'));
        tabMessages.addEventListener('click', () => switchTab('messages'));
        
        // 添加新标签：用户消息
        if (tabUserMessages && panelUserMessages) {
            console.log('设置用户消息标签点击事件');
            tabUserMessages.addEventListener('click', () => {
                console.log('用户消息标签被点击');
                switchTab('user-messages');
            });
            
            // 设置回复按钮事件
            document.addEventListener('click', function(e) {
                if (e.target && e.target.classList.contains('reply-btn')) {
                    const userId = e.target.getAttribute('data-userid');
                    const username = e.target.getAttribute('data-username');
                    handleReplyToUser(userId, username);
                }
            });
        }

        searchUsers.addEventListener('input', handleUserSearch);
        applyFiltersBtn.addEventListener('click', applyMessageFilters);

        // 检查是否已登录
        const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        if (isAdminLoggedIn) {
            showAdminPanel();
        }
    }
    
    // 处理管理员登录
    function handleAdminLogin() {
        const username = adminUsername.value.trim();
        const password = adminPassword.value;
        
        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password) {
            // 登录成功
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            showNotification('管理员登录成功');
        } else {
            // 登录失败
            showNotification('账号或密码错误');
        }
    }
    
    // 处理管理员登出
    function handleAdminLogout() {
        sessionStorage.removeItem('adminLoggedIn');
        showAdminLogin();
        showNotification('已退出管理员系统');
    }
    
    // 显示管理员面板
    function showAdminPanel() {
        adminLoginContainer.classList.add('hidden');
        adminPanelContainer.classList.remove('hidden');
        
        // 加载初始数据
        loadStatistics();
        loadAllUsers();
        switchTab('users');
        
        // 确保用户聊天标签存在
        const tabChat = document.getElementById('tab-chat');
        if (tabChat) {
            console.log('用户聊天标签已找到');
            tabChat.addEventListener('click', () => {
                console.log('用户聊天标签被点击');
                switchTab('chat');
            });
            
            // 设置聊天相关事件
            setupAdminChat();
        } else {
            console.error('找不到用户聊天标签');
        }
    }
    
    // 显示管理员登录
    function showAdminLogin() {
        adminLoginContainer.classList.remove('hidden');
        adminPanelContainer.classList.add('hidden');
        adminUsername.value = '';
        adminPassword.value = '';
    }
    
    // 切换标签
    function switchTab(tabName) {
        console.log(`切换到标签: ${tabName}`);
        
        // 获取所有标签和面板
        const tabUsers = document.getElementById('tab-users');
        const tabMessages = document.getElementById('tab-messages');
        const tabChat = document.getElementById('tab-chat');
        const panelUsers = document.getElementById('panel-users');
        const panelMessages = document.getElementById('panel-messages');
        const panelChat = document.getElementById('panel-chat');
        
        // 检查元素是否存在
        if (!tabUsers) console.error('找不到tab-users元素');
        if (!tabMessages) console.error('找不到tab-messages元素');
        if (!tabChat) console.error('找不到tab-chat元素');
        if (!panelUsers) console.error('找不到panel-users元素');
        if (!panelMessages) console.error('找不到panel-messages元素');
        if (!panelChat) console.error('找不到panel-chat元素');
        
        // 重置所有标签和面板
        [tabUsers, tabMessages, tabChat].forEach(tab => {
            if (tab) tab.classList.remove('active');
        });
        
        [panelUsers, panelMessages, panelChat].forEach(panel => {
            if (panel) panel.classList.add('hidden');
        });
        
        // 激活选定的标签和面板
        if (tabName === 'users') {
            if (tabUsers) tabUsers.classList.add('active');
            if (panelUsers) panelUsers.classList.remove('hidden');
        } else if (tabName === 'messages') {
            if (tabMessages) tabMessages.classList.add('active');
            if (panelMessages) panelMessages.classList.remove('hidden');
            // 加载消息数据
            loadAllMessages();
        } else if (tabName === 'chat') {
            console.log('切换到用户聊天标签');
            if (tabChat) tabChat.classList.add('active');
            if (panelChat) panelChat.classList.remove('hidden');
            // 加载用户列表
            loadUsersForChat();
        }
    }
    
    // 加载统计数据
    async function loadStatistics() {
        try {
            // 获取用户总数
            const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
            totalUsersElement.textContent = usersSnapshot.size;
            
            // 获取在线用户数
            const onlineUsersSnapshot = await db.collection(COLLECTIONS.USERS)
                .where('status', '==', STATUS.ONLINE)
                .get();
            onlineUsersCountElement.textContent = onlineUsersSnapshot.size;
            
            // 获取消息总数
            const messagesSnapshot = await db.collection(COLLECTIONS.MESSAGES).get();
            totalMessagesElement.textContent = messagesSnapshot.size;
        } catch (error) {
            console.error('加载统计数据失败:', error);
            showNotification('加载统计数据失败');
        }
    }
    
    // 加载所有用户
    async function loadAllUsers() {
        try {
            const snapshot = await db.collection(COLLECTIONS.USERS).get();
            allUsers = [];
            usernameMap = {};
            
            snapshot.forEach(doc => {
                const user = {
                    id: doc.id,
                    ...doc.data()
                };
                allUsers.push(user);
                usernameMap[user.id] = user.username;
            });
            
            renderUsersList(allUsers);
            populateUserFilter();
        } catch (error) {
            console.error('加载用户数据失败:', error);
            showNotification('加载用户数据失败');
        }
    }
    
    // 渲染用户列表
    function renderUsersList(users) {
        usersTbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // 格式化日期
            let createdAtStr = '未知';
            if (user.createdAt) {
                // 检查createdAt是否为Firestore时间戳对象（有toDate方法）或直接是Date对象
                const date = user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt;
                createdAtStr = date.toLocaleString();
            }
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.chatKey || '无'}</td>
                <td>
                    <span class="status-badge ${user.status === STATUS.ONLINE ? 'online' : 'offline'}">
                        ${user.status === STATUS.ONLINE ? '在线' : '离线'}
                    </span>
                </td>
                <td>${createdAtStr}</td>
                <td>
                    <button class="action-btn view-chat" data-id="${user.id}">查看聊天</button>
                    <button class="action-btn delete" data-id="${user.id}">删除</button>
                </td>
            `;
            
            // 添加事件监听器
            const viewChatBtn = row.querySelector('.view-chat');
            const deleteBtn = row.querySelector('.delete');
            
            viewChatBtn.addEventListener('click', () => {
                switchTab('messages');
                filterUser.value = user.id;
                applyMessageFilters();
            });
            
            deleteBtn.addEventListener('click', () => {
                if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复。`)) {
                    deleteUser(user.id);
                }
            });
            
            usersTbody.appendChild(row);
        });
    }
    
    // 删除用户
    async function deleteUser(userId) {
        try {
            // 删除用户
            await db.collection(COLLECTIONS.USERS).doc(userId).delete();
            
            // 删除OTP卡
            await db.collection(COLLECTIONS.OTP_CARDS).doc(userId).delete();
            
            // 重新加载用户列表
            loadAllUsers();
            loadStatistics();
            
            showNotification('用户已成功删除');
        } catch (error) {
            console.error('删除用户失败:', error);
            showNotification('删除用户失败');
        }
    }
    
    // 处理用户搜索
    function handleUserSearch() {
        const searchTerm = searchUsers.value.trim().toLowerCase();
        
        if (!searchTerm) {
            renderUsersList(allUsers);
            return;
        }
        
        // 筛选用户
        const filteredUsers = allUsers.filter(user => {
            return user.username.toLowerCase().includes(searchTerm) || 
                   (user.chatKey && user.chatKey.toLowerCase().includes(searchTerm));
        });
        
        renderUsersList(filteredUsers);
    }
    
    // 填充用户筛选下拉框
    function populateUserFilter() {
        // 保留第一个"全部用户"选项
        filterUser.innerHTML = '<option value="">全部用户</option>';
        
        // 添加用户选项
        allUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            filterUser.appendChild(option);
        });
    }
    
    // 加载所有消息
    async function loadAllMessages() {
        try {
            const snapshot = await db.collection(COLLECTIONS.MESSAGES).orderBy('timestamp', 'desc').get();
            allMessages = [];
            
            snapshot.forEach(doc => {
                const message = {
                    id: doc.id,
                    ...doc.data()
                };
                allMessages.push(message);
            });
            
            // 加载聊天信息
            await loadChatParticipants();
            
            renderMessagesList(allMessages);
        } catch (error) {
            console.error('加载消息数据失败:', error);
            showNotification('加载消息数据失败');
        }
    }
    
    // 加载聊天参与者
    async function loadChatParticipants() {
        try {
            // 获取所有聊天
            const chatsSnapshot = await db.collection(COLLECTIONS.CHATS).get();
            
            // 创建聊天ID到参与者的映射
            const chatParticipantsMap = {};
            
            chatsSnapshot.forEach(doc => {
                const chatData = doc.data();
                chatParticipantsMap[doc.id] = chatData.participants || [];
            });
            
            // 将参与者信息添加到消息中
            allMessages.forEach(message => {
                if (message.chatId) {
                    const participants = chatParticipantsMap[message.chatId] || [];
                    
                    // 发送者总是已知的
                    message.senderName = usernameMap[message.senderId] || '未知用户';
                    
                    // 接收者是参与者中除了发送者之外的用户
                    const recipientId = participants.find(id => id !== message.senderId);
                    message.recipientName = usernameMap[recipientId] || '未知用户';
                }
            });
        } catch (error) {
            console.error('加载聊天参与者失败:', error);
        }
    }
    
    // 渲染消息列表
    function renderMessagesList(messages) {
        messagesTbody.innerHTML = '';
        
        messages.forEach(message => {
            const row = document.createElement('tr');
            
            // 格式化日期
            let timestampStr = '未知';
            if (message.timestamp) {
                // 检查timestamp是否为Firestore时间戳对象（有toDate方法）或直接是Date对象
                const date = message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp;
                timestampStr = date.toLocaleString();
            }
            
            row.innerHTML = `
                <td>${timestampStr}</td>
                <td>${message.senderName || '未知'}</td>
                <td>${message.recipientName || '未知'}</td>
                <td>${message.content}</td>
            `;
            
            messagesTbody.appendChild(row);
        });
    }
    
    // 应用消息筛选
    function applyMessageFilters() {
        const userId = filterUser.value;
        const dateStart = filterDateStart.value ? new Date(filterDateStart.value) : null;
        const dateEnd = filterDateEnd.value ? new Date(filterDateEnd.value + 'T23:59:59') : null;
        
        let filteredMessages = [...allMessages];
        
        // 按用户筛选
        if (userId) {
            filteredMessages = filteredMessages.filter(message => {
                return message.senderId === userId || 
                       (message.chatId && message.chatId.includes(userId));
            });
        }
        
        // 按日期范围筛选
        if (dateStart || dateEnd) {
            filteredMessages = filteredMessages.filter(message => {
                if (!message.timestamp) return false;
                
                // 检查timestamp是否为Firestore时间戳对象（有toDate方法）或直接是Date对象
                const messageDate = message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp;
                
                if (dateStart && messageDate < dateStart) return false;
                if (dateEnd && messageDate > dateEnd) return false;
                
                return true;
            });
        }
        
        renderMessagesList(filteredMessages);
    }

    // 加载用户发送给管理员的消息
    async function loadUserMessages() {
        try {
            const userMessagesTbody = document.getElementById('user-messages-tbody');
            if (!userMessagesTbody) {
                console.error('找不到用户消息表格元素');
                return;
            }
            
            // 清空表格
            userMessagesTbody.innerHTML = '';
            
            // 获取用户消息
            console.log('正在加载管理员消息集合...');
            
            // 直接使用Firebase API获取数据
            const snapshot = await firebase.firestore().collection('admin_messages')
                .orderBy('timestamp', 'desc')
                .get();
            
            console.log(`加载到 ${snapshot.size} 条消息`);
            
            if (snapshot.empty) {
                // 没有消息时显示提示
                userMessagesTbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px;">
                            暂无用户消息
                        </td>
                    </tr>
                `;
                return;
            }
            
            // 按用户分组消息
            const messagesByUser = {};
            
            snapshot.forEach(doc => {
                const message = {
                    id: doc.id,
                    ...doc.data()
                };
                
                if (!message.userId) {
                    console.warn('消息缺少userId字段:', message);
                    return;
                }
                
                if (!messagesByUser[message.userId]) {
                    messagesByUser[message.userId] = [];
                }
                
                messagesByUser[message.userId].push(message);
            });
            
            console.log(`消息按用户分组: ${Object.keys(messagesByUser).length} 个用户`);
            console.log('用户消息分组:', messagesByUser);
            
            // 为每个用户创建一个展开/折叠的消息组
            for (const userId in messagesByUser) {
                const messages = messagesByUser[userId];
                if (messages.length === 0) continue;
                
                // 按时间排序消息，最新的在前
                messages.sort((a, b) => {
                    const timeA = a.timestamp && a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
                    const timeB = b.timestamp && b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
                    return timeB - timeA;
                });
                
                const latestMessage = messages[0];
                const username = latestMessage.username || '未知用户';
                
                // 创建用户消息组行
                const userRow = document.createElement('tr');
                userRow.className = 'user-message-group';
                userRow.dataset.userid = userId;
                
                // 格式化日期
                let timestampStr = '未知';
                if (latestMessage.timestamp) {
                    const date = latestMessage.timestamp.toDate ? latestMessage.timestamp.toDate() : new Date(latestMessage.timestamp);
                    timestampStr = date.toLocaleString();
                }
                
                // 计算未回复消息数
                const unreadCount = messages.filter(m => !m.isReply && !m.read).length;
                const badgeHtml = unreadCount > 0 
                    ? `<span class="badge">${unreadCount}</span>` 
                    : '';
                
                userRow.innerHTML = `
                    <td colspan="2">
                        <div class="user-message-header">
                            <button class="toggle-btn" data-userid="${userId}">+</button>
                            <span class="username">${username}</span>
                            ${badgeHtml}
                        </div>
                    </td>
                    <td>${timestampStr}</td>
                    <td>
                        <button class="action-btn reply-btn" data-userid="${userId}" data-username="${username}">回复</button>
                    </td>
                `;
                
                userMessagesTbody.appendChild(userRow);
                
                // 创建展开后的消息列表（初始隐藏）
                const messagesContainer = document.createElement('tr');
                messagesContainer.className = 'messages-container hidden';
                messagesContainer.dataset.userid = userId;
                
                const messagesCell = document.createElement('td');
                messagesCell.colSpan = 4;
                
                const messagesList = document.createElement('div');
                messagesList.className = 'user-messages-list';
                
                messages.forEach(message => {
                    const messageItem = document.createElement('div');
                    messageItem.className = `user-message-item ${message.isReply ? 'admin-reply' : ''}`;
                    
                    let msgTimestampStr = '未知';
                    if (message.timestamp) {
                        const date = message.timestamp.toDate ? message.timestamp.toDate() : new Date(message.timestamp);
                        msgTimestampStr = date.toLocaleString();
                    }
                    
                    messageItem.innerHTML = `
                        <div class="message-header">
                            <span class="sender">${message.isReply ? '管理员' : username}</span>
                            <span class="timestamp">${msgTimestampStr}</span>
                        </div>
                        <div class="message-content">${message.content}</div>
                    `;
                    
                    messagesList.appendChild(messageItem);
                });
                
                messagesCell.appendChild(messagesList);
                messagesContainer.appendChild(messagesCell);
                userMessagesTbody.appendChild(messagesContainer);
                
                // 添加Toggle按钮点击事件
                const toggleBtn = userRow.querySelector('.toggle-btn');
                toggleBtn.addEventListener('click', function() {
                    const isExpanded = this.textContent === '-';
                    this.textContent = isExpanded ? '+' : '-';
                    const container = document.querySelector(`.messages-container[data-userid="${userId}"]`);
                    if (container) {
                        container.classList.toggle('hidden');
                    }
                    
                    // 如果展开，将消息标记为已读
                    if (!isExpanded) {
                        markMessagesAsRead(userId);
                    }
                });
            }
            
        } catch (error) {
            console.error('加载用户消息失败:', error);
            showNotification('加载用户消息失败');
        }
    }
    
    // 标记用户消息为已读
    async function markMessagesAsRead(userId) {
        try {
            const batch = db.batch();
            
            const messagesSnapshot = await db.collection('admin_messages')
                .where('userId', '==', userId)
                .where('isReply', '==', false)
                .where('read', '==', false)
                .get();
            
            messagesSnapshot.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });
            
            await batch.commit();
        } catch (error) {
            console.error('标记消息为已读失败:', error);
        }
    }
    
    // 处理回复用户
    function handleReplyToUser(userId, username) {
        // 创建回复对话框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">回复用户: ${username}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="reply-content">消息内容:</label>
                        <textarea id="reply-content" class="terminal-input" rows="4"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="btn-send-reply" class="hacker-btn">发送回复</button>
                    <button class="hacker-btn secondary close-modal">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 显示对话框
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 关闭对话框事件
        const closeButtons = modal.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });
        });
        
        // 发送回复事件
        const sendReplyBtn = modal.querySelector('#btn-send-reply');
        sendReplyBtn.addEventListener('click', async () => {
            const replyContent = modal.querySelector('#reply-content').value.trim();
            
            if (replyContent) {
                try {
                    // 保存回复消息
                    await db.collection('admin_messages').add({
                        userId: userId,
                        content: replyContent,
                        timestamp: generateTimestamp(),
                        isReply: true,
                        read: false,
                        sentBy: 'admin',
                        username: username // 添加用户名，便于前端显示
                    });
                    
                    // 关闭对话框
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                    
                    // 刷新消息列表
                    loadUserMessages();
                    
                    showNotification('回复已发送');
                } catch (error) {
                    console.error('发送回复失败:', error);
                    showNotification('发送回复失败');
                }
            } else {
                showNotification('请输入回复内容');
            }
        });
    }

    // 设置管理员聊天功能
    function setupAdminChat() {
        const adminMessageInput = document.getElementById('admin-message-input');
        const adminSendMessage = document.getElementById('admin-send-message');
        
        if (adminMessageInput && adminSendMessage) {
            // 发送消息事件
            adminSendMessage.addEventListener('click', sendAdminMessage);
            
            // 回车发送消息
            adminMessageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendAdminMessage();
                }
            });
        }
    }
    
    // 加载用户列表用于聊天
    async function loadUsersForChat() {
        try {
            const adminUsers = document.getElementById('admin-users');
            if (!adminUsers) {
                console.error('找不到admin-users元素');
                return;
            }
            
            // 清空用户列表
            adminUsers.innerHTML = '';
            
            // 获取所有用户
            const snapshot = await db.collection(COLLECTIONS.USERS).get();
            
            if (snapshot.empty) {
                adminUsers.innerHTML = '<div class="empty-list">暂无用户</div>';
                return;
            }
            
            // 添加用户到列表
            snapshot.forEach(doc => {
                const userData = doc.data();
                // 排除管理员自己
                if (userData.isAdmin) return;
                
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.dataset.id = doc.id;
                userItem.dataset.username = userData.username;
                
                // 状态样式
                const statusStyle = `background-color: ${userData.status === STATUS.ONLINE ? 'var(--primary-color)' : '#555'}`;
                
                userItem.innerHTML = `
                    <div class="user-status" style="${statusStyle}"></div>
                    <span>${userData.username}</span>
                `;
                
                // 点击用户开始聊天
                userItem.addEventListener('click', () => {
                    selectUserForChat(doc.id, userData.username);
                });
                
                adminUsers.appendChild(userItem);
            });
            
            // 设置搜索功能
            const adminSearchUser = document.getElementById('admin-search-user');
            if (adminSearchUser) {
                adminSearchUser.addEventListener('input', () => {
                    const searchTerm = adminSearchUser.value.trim().toLowerCase();
                    const userItems = adminUsers.querySelectorAll('.user-item');
                    
                    userItems.forEach(item => {
                        const username = item.dataset.username.toLowerCase();
                        if (username.includes(searchTerm)) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            }
            
        } catch (error) {
            console.error('加载用户列表失败:', error);
            showNotification('加载用户列表失败');
        }
    }
    
    // 选择用户进行聊天
    async function selectUserForChat(userId, username) {
        try {
            // 更新聊天头部
            const adminChatHeader = document.getElementById('admin-chat-header');
            if (adminChatHeader) {
                adminChatHeader.innerHTML = `<h4>与 ${username} 聊天</h4>`;
            }
            
            // 激活输入框
            const adminMessageInput = document.getElementById('admin-message-input');
            const adminSendMessage = document.getElementById('admin-send-message');
            
            if (adminMessageInput && adminSendMessage) {
                adminMessageInput.disabled = false;
                adminSendMessage.disabled = false;
                
                // 存储当前聊天用户ID
                adminSendMessage.dataset.userId = userId;
                adminSendMessage.dataset.username = username;
                
                // 创建或获取聊天ID
                const chatId = await createOrGetAdminChat(userId);
                adminSendMessage.dataset.chatId = chatId;
            }
            
            // 加载聊天历史
            loadAdminChatHistory(userId);
            
        } catch (error) {
            console.error('选择用户聊天失败:', error);
            showNotification('选择用户聊天失败');
        }
    }
    
    // 创建或获取管理员与用户的聊天
    async function createOrGetAdminChat(userId) {
        try {
            // 获取管理员ID
            const adminId = 'admin'; // 使用固定的管理员ID
            
            // 检查是否已存在聊天
            const existingChat = await db.collection(COLLECTIONS.CHATS)
                .where('participants', 'array-contains', adminId)
                .get();
            
            let chatId = null;
            
            // 查找包含两个用户的聊天
            for (const doc of existingChat.docs) {
                const participants = doc.data().participants;
                if (participants.includes(userId)) {
                    chatId = doc.id;
                    break;
                }
            }
            
            // 如果不存在，创建新聊天
            if (!chatId) {
                const chatRef = await db.collection(COLLECTIONS.CHATS).add({
                    participants: [adminId, userId],
                    createdAt: generateTimestamp(),
                    updatedAt: generateTimestamp()
                });
                
                chatId = chatRef.id;
            }
            
            return chatId;
            
        } catch (error) {
            console.error('创建或获取聊天失败:', error);
            throw error;
        }
    }
    
    // 加载管理员与用户的聊天历史
    async function loadAdminChatHistory(userId) {
        try {
            const adminMessages = document.getElementById('admin-messages');
            if (!adminMessages) {
                console.error('找不到admin-messages元素');
                return;
            }
            
            // 清空消息容器
            adminMessages.innerHTML = '';
            
            // 获取管理员ID
            const adminId = 'admin';
            
            // 创建或获取聊天ID
            const chatId = await createOrGetAdminChat(userId);
            
            // 获取聊天历史
            const snapshot = await db.collection(COLLECTIONS.MESSAGES)
                .where('chatId', '==', chatId)
                .orderBy('timestamp', 'asc')
                .get();
            
            if (snapshot.empty) {
                adminMessages.innerHTML = '<div class="empty-chat">暂无聊天记录</div>';
                return;
            }
            
            // 显示消息
            snapshot.forEach(doc => {
                const msgData = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = `message ${msgData.senderId === adminId ? 'sent' : 'received'}`;
                messageElement.dataset.id = doc.id;
                
                // 格式化时间
                let timestampStr = '未知';
                if (msgData.timestamp) {
                    const date = msgData.timestamp.toDate ? msgData.timestamp.toDate() : new Date(msgData.timestamp);
                    timestampStr = date.toLocaleString();
                }
                
                messageElement.innerHTML = `
                    <div class="message-header">${timestampStr}</div>
                    <div class="message-content">${msgData.content}</div>
                `;
                
                adminMessages.appendChild(messageElement);
            });
            
            // 滚动到底部
            setTimeout(() => {
                adminMessages.scrollTop = adminMessages.scrollHeight;
            }, 100);
            
            // 设置实时监听
            setupAdminChatListener(chatId);
            
        } catch (error) {
            console.error('加载聊天历史失败:', error);
            showNotification('加载聊天历史失败');
        }
    }
    
    // 设置管理员聊天实时监听
    function setupAdminChatListener(chatId) {
        // 如果有之前的监听器，先取消
        if (window.adminChatUnsubscribe) {
            window.adminChatUnsubscribe();
        }
        
        // 设置新的监听器
        window.adminChatUnsubscribe = db.collection(COLLECTIONS.MESSAGES)
            .where('chatId', '==', chatId)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .onSnapshot(snapshot => {
                if (snapshot.empty) return;
                
                // 获取当前显示的所有消息ID
                const adminMessages = document.getElementById('admin-messages');
                const displayedMessageIds = Array.from(
                    adminMessages.querySelectorAll('.message')
                ).map(el => el.dataset.id);
                
                // 检查新消息
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const newMsg = change.doc;
                        // 只有当消息不在当前显示列表中时才重新加载
                        if (!displayedMessageIds.includes(newMsg.id)) {
                            // 重新加载聊天历史
                            const adminSendMessage = document.getElementById('admin-send-message');
                            if (adminSendMessage && adminSendMessage.dataset.userId) {
                                loadAdminChatHistory(adminSendMessage.dataset.userId);
                            }
                        }
                    }
                });
            });
    }
    
    // 发送管理员消息
    async function sendAdminMessage() {
        try {
            const adminMessageInput = document.getElementById('admin-message-input');
            const adminSendMessage = document.getElementById('admin-send-message');
            
            if (!adminMessageInput || !adminSendMessage) return;
            
            const content = adminMessageInput.value.trim();
            if (!content) return;
            
            const userId = adminSendMessage.dataset.userId;
            const chatId = adminSendMessage.dataset.chatId;
            
            if (!userId || !chatId) {
                showNotification('请先选择一个用户');
                return;
            }
            
            // 创建消息
            const message = {
                chatId: chatId,
                senderId: 'admin', // 使用固定的管理员ID
                content: content,
                timestamp: generateTimestamp(),
                read: false
            };
            
            // 保存消息到messages集合
            await db.collection(COLLECTIONS.MESSAGES).add(message);
            
            // 更新聊天的最后更新时间
            await db.collection(COLLECTIONS.CHATS).doc(chatId).update({
                updatedAt: generateTimestamp()
            });
            
            // 清空输入框
            adminMessageInput.value = '';
            
            // 滚动到底部
            const adminMessages = document.getElementById('admin-messages');
            if (adminMessages) {
                setTimeout(() => {
                    adminMessages.scrollTop = adminMessages.scrollHeight;
                }, 100);
            }
            
        } catch (error) {
            console.error('发送消息失败:', error);
            showNotification('发送消息失败');
        }
    }
});

// 在页面加载时创建管理员用户
// 注意：此功能已移至config.js中的initAdminAccount函数 