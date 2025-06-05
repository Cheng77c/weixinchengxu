# 微信小程序后端服务

这是一个基于Koa2框架的微信小程序后端服务，提供用户认证、项目管理和客户管理等功能。

## 技术栈

- Node.js
- Koa2
- MySQL
- Sequelize ORM
- JWT认证

## 项目结构

```
backend/
├── app.js             # 应用入口文件
├── config.js          # 配置文件
├── controllers/       # 控制器
├── db/                # 数据库相关
├── middleware/        # 中间件
├── models/            # 数据模型
├── routes/            # 路由
├── utils/             # 工具函数
└── package.json       # 依赖管理
```

## 安装与运行

### 环境要求

- Node.js 14.0+
- MySQL 5.7+

### 安装依赖

```bash
npm install
```

### 配置

修改 `config.js` 文件中的数据库配置和JWT密钥等信息。

### 初始化数据库

```bash
npm run init-db
```

### 启动开发服务器

```bash
npm run dev
```

### 生产环境启动

```bash
npm start
```

## API接口

### 用户认证

- `POST /auth/phone-register` - 手机号注册
- `POST /auth/phone-login` - 手机号登录
- `POST /auth/wechat-login` - 微信登录
- `POST /auth/bind-wechat` - 绑定微信和手机号
- `GET /auth/user-info` - 获取用户信息（需要认证）

## 授权和认证

API使用JWT（JSON Web Token）进行认证。客户端需要在请求头中包含`Authorization: Bearer <token>`。 