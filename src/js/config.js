// Firebase 配置
const firebaseConfig = {
    // 注意: 请将下面的配置替换为您自己的Firebase项目配置
    apiKey: "AIzaSyDfDFqNoJbdCQpaMLkgvtP1h4qtkYjsmKc",
    authDomain: "secret-chat-3c2a5.firebaseapp.com",
    projectId: "secret-chat-3c2a5",
    storageBucket: "secret-chat-3c2a5.firebasestorage.app",
    messagingSenderId: "859731309017",
    appId: "1:859731309017:web:eaaf422532266a3d94a9c8",
    measurementId: "G-V74DZG9G63",
    databaseURL: "https://secret-chat-3c2a5-default-rtdb.asia-southeast1.firebasedatabase.app" // 添加Realtime Database URL
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 数据库引用
const db = firebase.firestore();
const rtdb = firebase.database();

// 配置Firestore离线持久化 - 使用新的推荐方法
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true
});

db.enablePersistence({
    synchronizeTabs: true
}).catch(err => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore持久化失败: 可能有多个标签页打开');
    } else if (err.code === 'unimplemented') {
        console.warn('当前浏览器不支持Firestore离线持久化');
    }
});

// 身份验证服务
const auth = firebase.auth();

// 常量
const COLLECTIONS = {
    USERS: 'users',
    CHATS: 'chats',
    MESSAGES: 'messages',
    OTP_CARDS: 'otp_cards'
};

const STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline'
};

// 管理员ID
const ADMIN_ID = 'admin';

// 监听连接状态
let isFirebaseConnected = false;
rtdb.ref('.info/connected').on('value', (snap) => {
    isFirebaseConnected = snap.val() === true;
    console.log(`Firebase连接状态: ${isFirebaseConnected ? '在线' : '离线'}`);
    
    // 连接恢复后初始化管理员账号
    if (isFirebaseConnected) {
        setTimeout(() => {
            initAdminAccount();
        }, 2000); // 延迟2秒确保连接稳定
    }
});

// 初始化管理员账号
async function initAdminAccount() {
    try {
        // 检查是否连接到Firebase
        if (!isFirebaseConnected) {
            console.warn('Firebase连接不可用，将在连接恢复后初始化管理员账号');
            return;
        }
        
        // 检查管理员账号是否存在
        const adminDoc = await db.collection(COLLECTIONS.USERS).doc(ADMIN_ID).get();
        
        if (!adminDoc.exists) {
            // 创建管理员账号
            await db.collection(COLLECTIONS.USERS).doc(ADMIN_ID).set({
                username: '管理员',
                status: STATUS.ONLINE,
                isAdmin: true,
                createdAt: generateTimestamp(),
                lastSeen: generateTimestamp()
            });
            console.log('管理员账号已创建');
        } else {
            console.log('管理员账号已存在');
        }
    } catch (error) {
        console.error('初始化管理员账号失败:', error);
        
        // 如果是离线错误，不再重试，等待连接状态监听器触发
        if (error.message && error.message.includes('offline')) {
            console.warn('Firebase离线中，等待连接恢复后自动重试');
            return;
        }
        
        // 其他错误延迟重试
        setTimeout(initAdminAccount, 5000);
    }
}

// 辅助函数
function generateTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

// 错误处理
function handleError(error) {
    console.error('Firebase Error:', error);
    
    // 针对特定错误类型提供更友好的消息
    let errorMessage = error.message || '未知错误';
    
    if (error.code === 'permission-denied') {
        errorMessage = '权限被拒绝，请检查Firebase安全规则';
    } else if (error.code === 'unavailable') {
        errorMessage = '无法连接到Firebase服务器，请检查网络连接';
    } else if (error.code === 'failed-precondition') {
        errorMessage = '操作失败，可能需要创建索引';
    }
    
    showNotification(`错误: ${errorMessage}`);
}

// 通知系统
function showNotification(message, duration = 3000) {
    const notificationElement = document.getElementById('notification');
    if (!notificationElement) {
        console.error('找不到通知元素');
        return;
    }
    
    notificationElement.textContent = message;
    notificationElement.classList.remove('hidden');
    
    setTimeout(() => {
        notificationElement.classList.add('hidden');
    }, duration);
}

// 页面加载时不再直接初始化管理员账号，由连接状态监听器触发 