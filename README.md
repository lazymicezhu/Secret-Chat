# 秘密聊天应用 (Secret Chat)

一个具有仿黑客/暗网风格的加密聊天应用，采用多重身份验证机制。
演示站：https://lazymicezhu.github.io/Secret-Chat/

## 功能特点

- 黑客/暗网风格界面设计
- 基于种子数字生成的独特聊天密钥
- 多因素认证 (密钥 + 密码 + OTP 卡)
- 实时在线用户状态显示
- 私人一对一聊天功能

## 技术实现

- 前端：HTML、CSS、JavaScript
- 后端：Firebase (Firestore + Realtime Database)
- 实时聊天：Firebase Realtime Database

## 使用指南

### 安装与配置

1. 在 Firebase 控制台创建新项目
2. 启用 Authentication、Firestore 和 Realtime Database 服务
3. 复制 Firebase 配置信息并替换`src/js/config.js`中的配置
4. 部署 Firebase 安全规则

### 本地运行

您可以使用任何静态文件服务器运行此项目，例如：

```bash
# 使用Python的简易HTTP服务器
python -m http.server 8080

# 或使用Node.js的http-server
npx http-server
```

然后在浏览器中访问 `http://localhost:8080`

## 安全注意事项

- 此应用为演示目的构建，在生产环境中使用前需要增强安全措施
- OTP 卡的验证码应当加密存储
- 密码应使用更强大的哈希算法和加盐处理
- 需要配置适当的 Firebase 安全规则

## Firebase 安全规则示例

以下是建议的 Firestore 安全规则：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    match /messages/{messageId} {
      allow read: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants;
      allow create: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(request.resource.data.chatId)).data.participants;
    }

    match /otp_cards/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
