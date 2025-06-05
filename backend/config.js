// config.js
require('dotenv').config();

module.exports = {
  port: 3001,
  database: {
    host: '8.147.233.221',
    port: 3306,
    database: 'YING',
    username: 'root',
    password: '020701',
    dialect: 'mysql'
  },
  jwt: {
    secret: 'weixin-app-secret-key-2024',
    expiresIn: '7d'
  },
  wechat: {
    appid: 'wx1df66a91e2b361a9',
    secret: 'a137e107f556486a54e2907f1e4e01e8'
  },
  wxAppId: 'your-wechat-app-id',
  wxAppSecret: 'your-wechat-app-secret'
};