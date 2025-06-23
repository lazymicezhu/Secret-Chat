// 应用主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // DOM元素引用
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('chat-container');
    
    // 登录选项
    const btnExistingKey = document.getElementById('btn-existing-key');
    const btnCreateKey = document.getElementById('btn-create-key');
    const loginExisting = document.getElementById('login-existing');
    const createKey = document.getElementById('create-key');
    const loginOptions = document.querySelector('.login-options');
    
    // 登录表单
    const inputKey = document.getElementById('input-key');
    const inputPassword = document.getElementById('input-password');
    const inputOtp = document.getElementById('input-otp');
    const otpCoordinate = document.getElementById('otp-coordinate');
    const btnLogin = document.getElementById('btn-login');
    const btnBackToOptions = document.getElementById('btn-back-to-options');
    
    // 创建密钥表单
    const seedInputs = document.querySelectorAll('.seed-input');
    const btnGenerateKey = document.getElementById('btn-generate-key');
    const btnBackFromCreate = document.getElementById('btn-back-from-create');
    const keyGenerationResult = document.getElementById('key-generation-result');
    const generatedKey = document.getElementById('generated-key');
    
    // 注册表单
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerPasswordConfirm = document.getElementById('register-password-confirm');
    const btnRegister = document.getElementById('btn-register');
    
    // OTP卡显示
    const otpCardDisplay = document.getElementById('otp-card-display');
    const btnSaveOtp = document.getElementById('btn-save-otp');
    
    // 聊天界面
    const usernameDisplay = document.getElementById('username-display');
    const onlineUsersList = document.getElementById('online-users-list');
    const searchUsername = document.getElementById('search-username');
    const btnSearchUser = document.getElementById('btn-search-user');
    const chatWith = document.getElementById('chat-with');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const btnSendMessage = document.getElementById('btn-send-message');
    
    // 启动应用
    initApp();
    
    // 初始化应用
    function initApp() {
        // 初始化事件监听器
        setupAuthEventListeners();
        setupChatEventListeners();
        
        // 检查是否已登录
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            showChatInterface(currentUser);
        } else {
            showAuthInterface();
        }
    }
    
    // 设置认证页面事件监听器
    function setupAuthEventListeners() {
        // 使用已有密钥
        btnExistingKey.addEventListener('click', () => {
            loginOptions.classList.add('hidden');
            loginExisting.classList.remove('hidden');
            
            // 生成随机OTP坐标
            const coordinate = authService.getRandomOTPCoordinate();
            authService.currentOtpCoordinate = coordinate;
            otpCoordinate.textContent = coordinate;
        });
        
        // 创建新密钥
        btnCreateKey.addEventListener('click', () => {
            loginOptions.classList.add('hidden');
            createKey.classList.remove('hidden');
        });
        
        // 返回按钮 (从登录页)
        btnBackToOptions.addEventListener('click', () => {
            loginExisting.classList.add('hidden');
            loginOptions.classList.remove('hidden');
        });
        
        // 返回按钮 (从创建密钥页)
        btnBackFromCreate.addEventListener('click', () => {
            createKey.classList.add('hidden');
            loginOptions.classList.remove('hidden');
            keyGenerationResult.classList.add('hidden');
        });
        
        // 自动移动到下一个输入框
        seedInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 3) {
                    if (index < seedInputs.length - 1) {
                        seedInputs[index + 1].focus();
                    }
                }
            });
        });
        
        // 生成密钥按钮
        btnGenerateKey.addEventListener('click', () => {
            try {
                const seeds = Array.from(seedInputs).map(input => parseInt(input.value));
                
                // 验证所有输入都是三位数字
                if (!seeds.every(seed => seed >= 100 && seed <= 999)) {
                    throw new Error('请输入4个三位数字');
                }
                
                // 生成密钥
                const chatKey = authService.generateChatKey(seeds);
                generatedKey.textContent = chatKey;
                
                // 显示结果和注册表单
                keyGenerationResult.classList.remove('hidden');
                btnGenerateKey.classList.add('hidden');
                
            } catch (error) {
                handleError(error);
            }
        });
        
        // 注册按钮
        btnRegister.addEventListener('click', async () => {
            try {
                const chatKey = generatedKey.textContent;
                const username = registerUsername.value.trim();
                const password = registerPassword.value;
                const confirmPassword = registerPasswordConfirm.value;
                
                // 验证输入
                if (!chatKey) {
                    throw new Error('无效的聊天密钥');
                }
                
                if (!username) {
                    throw new Error('请输入用户名');
                }
                
                if (password.length < 6) {
                    throw new Error('密码长度必须至少为6个字符');
                }
                
                if (password !== confirmPassword) {
                    throw new Error('两次输入的密码不匹配');
                }
                
                // 生成OTP卡
                const otpCard = authService.generateOTPCard();
                authService.otpCard = otpCard;
                
                // 注册用户
                await authService.registerUser(chatKey, username, password, otpCard);
                
                // 显示OTP卡
                createKey.classList.add('hidden');
                otpCardDisplay.classList.remove('hidden');
                authService.renderOTPCard(otpCard);
                
            } catch (error) {
                handleError(error);
            }
        });
        
        // OTP卡保存按钮
        btnSaveOtp.addEventListener('click', () => {
            otpCardDisplay.classList.add('hidden');
            loginOptions.classList.remove('hidden');
            showNotification('注册完成，请使用您的聊天密钥登录');
        });
        
        // 登录按钮
        btnLogin.addEventListener('click', async () => {
            try {
                const chatKey = inputKey.value.trim();
                const password = inputPassword.value;
                const otpCode = inputOtp.value.trim();
                
                // 验证输入
                if (!chatKey || !password || !otpCode) {
                    throw new Error('请填写所有字段');
                }
                
                // 登录
                const user = await authService.loginWithKey(chatKey, password, otpCode);
                
                // 显示聊天界面
                if (user) {
                    showChatInterface(user);
                }
                
            } catch (error) {
                handleError(error);
            }
        });
    }
    
    // 设置聊天页面事件监听器
    function setupChatEventListeners() {
        // 搜索用户按钮
        btnSearchUser.addEventListener('click', async () => {
            const username = searchUsername.value.trim();
            if (!username) return;
            
            try {
                const user = await chatService.findUserByUsername(username);
                if (user) {
                    initChat(user);
                } else {
                    showNotification('找不到该用户');
                }
            } catch (error) {
                handleError(error);
            }
        });
        
        // 发送消息按钮
        btnSendMessage.addEventListener('click', sendMessage);
        
        // 发送消息按回车键
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // 发送消息函数
    async function sendMessage() {
        try {
            const content = messageInput.value.trim();
            if (!content) return;
            
            const currentUser = authService.getCurrentUser();
            const chatId = chatService.getCurrentChatId();
            const recipient = chatService.getCurrentRecipient();
            
            if (!currentUser || !chatId) {
                throw new Error('没有活动的聊天');
            }
            
            // 发送消息
            await chatService.sendMessage(chatId, currentUser.id, content);
            messageInput.value = '';
            
        } catch (error) {
            handleError(error);
        }
    }
    
    // 显示认证界面
    function showAuthInterface() {
        authContainer.classList.remove('hidden');
        chatContainer.classList.add('hidden');
        
        // 重置表单
        loginOptions.classList.remove('hidden');
        loginExisting.classList.add('hidden');
        createKey.classList.add('hidden');
        otpCardDisplay.classList.add('hidden');
        keyGenerationResult.classList.add('hidden');
        btnGenerateKey.classList.remove('hidden');
        
        seedInputs.forEach(input => input.value = '');
        inputKey.value = '';
        inputPassword.value = '';
        inputOtp.value = '';
        registerUsername.value = '';
        registerPassword.value = '';
        registerPasswordConfirm.value = '';
    }
    
    // 显示聊天界面
    function showChatInterface(user) {
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        
        // 显示用户名
        usernameDisplay.textContent = user.username;
        
        // 初始化可折叠面板
        initCollapsiblePanels();
        
        // 监听在线用户
        chatService.listenToOnlineUsers(updateOnlineUsersList);
        
        // 加载好友列表
        loadFriendsList(user.id);
    }
    
    // 初始化可折叠面板
    function initCollapsiblePanels() {
        // 创建在线用户可折叠面板
        const onlineUsersPanel = document.querySelector('.online-users-panel');
        if (onlineUsersPanel) {
            // 获取或创建在线用户标题
            let onlineUsersHeader = onlineUsersPanel.querySelector('.panel-header');
            if (!onlineUsersHeader) {
                const originalTitle = onlineUsersPanel.querySelector('h3');
                if (originalTitle) {
                    // 创建新的标题栏
                    onlineUsersHeader = document.createElement('div');
                    onlineUsersHeader.className = 'panel-header';
                    onlineUsersHeader.innerHTML = `
                        <div class="header-content">
                            <span class="toggle-icon">▼</span>
                            <h3>${originalTitle.textContent}</h3>
                        </div>
                    `;
                    
                    // 替换原标题
                    originalTitle.replaceWith(onlineUsersHeader);
                    
                    // 添加点击事件
                    onlineUsersHeader.addEventListener('click', function() {
                        const icon = this.querySelector('.toggle-icon');
                        const usersList = document.getElementById('online-users-list');
                        
                        if (icon.textContent === '▼') {
                            icon.textContent = '▶';
                            usersList.classList.add('hidden');
                        } else {
                            icon.textContent = '▼';
                            usersList.classList.remove('hidden');
                        }
                    });
                }
            }
        }
        
        // 创建好友列表面板
        const friendsPanel = document.createElement('div');
        friendsPanel.className = 'friends-panel';
        friendsPanel.innerHTML = `
            <div class="panel-header">
                <div class="header-content">
                    <span class="toggle-icon">▼</span>
                    <h3>您的好友</h3>
                </div>
            </div>
            <div id="friends-list" class="users-list"></div>
        `;
        
        // 调整布局，将好友列表添加到在线用户面板前面
        if (onlineUsersPanel) {
            // 获取聊天布局容器
            const chatLayout = document.querySelector('.chat-layout');
            if (chatLayout) {
                // 将在线用户面板移到最后
                const chatPanel = document.querySelector('.chat-panel');
                if (chatPanel) {
                    // 创建右侧面板容器
                    const sidePanel = document.createElement('div');
                    sidePanel.className = 'side-panel';
                    
                    // 将在线用户面板和好友面板移到右侧
                    chatLayout.appendChild(sidePanel);
                    sidePanel.appendChild(friendsPanel);
                    sidePanel.appendChild(onlineUsersPanel);
                }
            } else {
                // 如果找不到聊天布局，则添加到在线用户面板前面
                onlineUsersPanel.parentNode.insertBefore(friendsPanel, onlineUsersPanel);
            }
            
            // 添加点击事件
            const friendsHeader = friendsPanel.querySelector('.panel-header');
            friendsHeader.addEventListener('click', function() {
                const icon = this.querySelector('.toggle-icon');
                const friendsList = document.getElementById('friends-list');
                
                if (icon.textContent === '▼') {
                    icon.textContent = '▶';
                    friendsList.classList.add('hidden');
                } else {
                    icon.textContent = '▼';
                    friendsList.classList.remove('hidden');
                }
            });
        }
    }
    
    // 加载好友列表
    async function loadFriendsList(userId) {
        try {
            const friendsList = document.getElementById('friends-list');
            if (!friendsList) return;
            
            // 清空列表
            friendsList.innerHTML = '';
            
            // 获取好友关系
            const friendsSnapshot = await db.collection('friends')
                .where('userId', '==', userId)
                .get();
            
            if (friendsSnapshot.empty) {
                friendsList.innerHTML = '<div class="empty-list">您还没有添加好友</div>';
                return;
            }
            
            // 获取所有好友ID
            const friendIds = [];
            friendsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.friendId) {
                    friendIds.push(data.friendId);
                }
            });
            
            if (friendIds.length === 0) {
                friendsList.innerHTML = '<div class="empty-list">您还没有添加好友</div>';
                return;
            }
            
            // 获取好友用户信息
            const usersSnapshot = await db.collection(COLLECTIONS.USERS)
                .where(firebase.firestore.FieldPath.documentId(), 'in', friendIds)
                .get();
            
            if (usersSnapshot.empty) {
                friendsList.innerHTML = '<div class="empty-list">无法加载好友信息</div>';
                return;
            }
            
            // 显示好友列表
            usersSnapshot.forEach(doc => {
                const user = {
                    id: doc.id,
                    ...doc.data()
                };
                
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                
                const statusStyle = `background-color: ${user.status === STATUS.ONLINE ? 'var(--primary-color)' : '#555'}`;
                
                userItem.innerHTML = `
                    <div class="user-status" style="${statusStyle}"></div>
                    <span>${user.username}</span>
                `;
                
                // 点击用户开始聊天
                userItem.addEventListener('click', () => {
                    initChat(user);
                });
                
                friendsList.appendChild(userItem);
            });
            
        } catch (error) {
            console.error('加载好友列表失败:', error);
            const friendsList = document.getElementById('friends-list');
            if (friendsList) {
                friendsList.innerHTML = '<div class="empty-list">加载好友列表失败</div>';
            }
        }
    }
    
    // 更新在线用户列表
    function updateOnlineUsersList(users) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        
        // 清空列表
        onlineUsersList.innerHTML = '';
        
        // 添加用户到列表
        users.forEach(user => {
            // 不显示当前用户
            if (user.id === currentUser.id) return;
            
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            // 为管理员添加特殊样式
            const statusStyle = user.isAdmin 
                ? 'background-color: #ff8800;' 
                : `background-color: ${user.status === STATUS.ONLINE ? 'var(--primary-color)' : '#555'}`;
            
            userItem.innerHTML = `
                <div class="user-status" style="${statusStyle}"></div>
                <span>${user.username}${user.isAdmin ? ' [管理员]' : ''}</span>
                <button class="add-friend-btn" data-id="${user.id}" title="添加为好友">+</button>
            `;
            
            // 点击用户开始聊天
            userItem.addEventListener('click', (e) => {
                // 如果点击的是添加好友按钮，则不开始聊天
                if (e.target.classList.contains('add-friend-btn')) {
                    e.stopPropagation();
                    addFriend(currentUser.id, user.id, user.username);
                    return;
                }
                
                initChat(user);
            });
            
            onlineUsersList.appendChild(userItem);
        });
    }
    
    // 添加好友
    async function addFriend(userId, friendId, friendName) {
        try {
            // 检查是否已经是好友
            const friendSnapshot = await db.collection('friends')
                .where('userId', '==', userId)
                .where('friendId', '==', friendId)
                .get();
            
            if (!friendSnapshot.empty) {
                showNotification(`${friendName} 已经是您的好友`);
                return;
            }
            
            // 添加好友关系
            await db.collection('friends').add({
                userId: userId,
                friendId: friendId,
                addedAt: generateTimestamp()
            });
            
            showNotification(`已添加 ${friendName} 为好友`);
            
            // 重新加载好友列表
            loadFriendsList(userId);
            
        } catch (error) {
            console.error('添加好友失败:', error);
            showNotification('添加好友失败');
        }
    }
    
    // 初始化聊天
    async function initChat(recipient) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                throw new Error('用户未登录');
            }
            
            // 管理员特殊处理
            if (recipient.isAdmin && recipient.id === 'admin') {
                // 创建或获取管理员聊天ID
                const chatId = await chatService.createOrGetChat(currentUser.id, 'admin');
                chatService.setCurrentChat(chatId, recipient);
                
                // 更新UI
                chatWith.textContent = recipient.username + ' [管理员]';
                
                // 清空消息容器
                messages.innerHTML = '';
                
                // 监听消息
                chatService.listenToChatMessages(chatId, updateMessages);
                
                return;
            }
            
            // 常规用户聊天处理
            const chatId = await chatService.createOrGetChat(currentUser.id, recipient.id);
            
            // 设置当前聊天
            chatService.setCurrentChat(chatId, recipient);
            
            // 更新UI
            chatWith.textContent = recipient.username;
            
            // 清空消息容器
            messages.innerHTML = '';
            
            // 监听消息
            chatService.listenToChatMessages(chatId, updateMessages);
            
        } catch (error) {
            handleError(error);
        }
    }
    
    // 更新消息列表
    function updateMessages(messagesList) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;
        
        // 清空消息容器
        messages.innerHTML = '';
        
        // 添加消息到列表
        messagesList.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.senderId === currentUser.id ? 'sent' : 'received'}`;
            messageElement.dataset.id = message.id;
            
            // 格式化时间
            let timestampStr = '发送中...';
            if (message.timestamp) {
                // 检查timestamp是否为Firestore时间戳对象（有toDate方法）或直接是Date对象
                const timestamp = message.timestamp.toDate ? message.timestamp.toDate() : message.timestamp;
                timestampStr = timestamp.toLocaleString();
            }
            
            messageElement.innerHTML = `
                <div class="message-header">${timestampStr}</div>
                <div class="message-content">${message.content}</div>
            `;
            
            messages.appendChild(messageElement);
        });
        
        // 始终滚动到底部
        setTimeout(() => {
            messages.scrollTop = messages.scrollHeight;
        }, 50);
    }
    
    // 当窗口关闭或刷新时注销用户
    window.addEventListener('beforeunload', () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            // 清理监听器
            chatService.unsubscribeAll();
            
            // 注销用户（为了确保离线状态更新，使用同步操作）
            fetch(`/api/logout/${currentUser.id}`, {
                method: 'POST',
                keepalive: true
            });
        }
    });
}); 