# Firebase 部署指南

## 前置条件

1. 安装 Node.js 和 npm
2. 安装 Firebase CLI: `npm install -g firebase-tools`

## 部署步骤

### 1. 登录 Firebase

```bash
firebase login
```

### 2. 初始化项目（如果尚未初始化）

```bash
firebase init
```

选择以下服务:

- Firestore
- Realtime Database
- Hosting

### 3. 部署 Firebase 规则和索引

```bash
firebase deploy --only firestore:rules,firestore:indexes,database
```

### 4. 部署网站

```bash
firebase deploy --only hosting
```

### 5. 完整部署

```bash
firebase deploy
```

## 常见问题

### 索引错误

如果遇到索引错误，通常会在控制台看到类似以下错误:

```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

解决方法:

1. 点击错误中的链接
2. 在 Firebase 控制台中创建索引
3. 等待索引构建完成（可能需要几分钟）

### 安全规则错误

如果遇到权限错误，检查:

1. `firestore.rules`文件是否正确配置
2. 是否已部署最新的安全规则

### 离线模式问题

如果应用在离线模式下工作不正常:

1. 确保已启用离线持久化 (`db.enablePersistence()`)
2. 检查浏览器是否支持 IndexedDB
3. 确保没有多个标签页同时打开应用（可能导致持久化失败）

## 重要文件

- `firebase.json`: Firebase 项目配置
- `firestore.rules`: Firestore 安全规则
- `firestore.indexes.json`: Firestore 索引配置
- `database.rules.json`: Realtime Database 安全规则
