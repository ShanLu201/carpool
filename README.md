# 拼车平台

一个基于 React + TypeScript + Vite (前端) 和 Node.js + Express (后端) 的拼车平台，支持乘客和车主发布信息、筛选匹配、实时聊天等功能。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Ant Design
- **后端**: Node.js + Express + TypeScript + Socket.IO
- **数据库**: MySQL 8.0
- **实时通信**: WebSocket (Socket.IO)

## 功能特性

### 乘客功能
- 发布用车需求（日期、时间、出发地、目的地、人数、费用等）
- 查看车主邀客信息
- 按出发时间、出发地、目的地筛选
- 与车主实时聊天

### 车主功能
- 发布邀客信息（日期、时间、出发地、目的地、可载人数、费用、车型等）
- 查看乘客需求信息
- 按出发时间、出发地、目的地筛选
- 与乘客实时聊天

### 通用功能
- 手机号注册/登录
- 实名认证
- 个人资料管理
- 在线实时聊天
- 消息已读状态

## 项目结构

```
trip/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑层
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由定义
│   │   ├── validators/     # 请求验证
│   │   ├── utils/          # 工具函数
│   │   ├── socket/         # WebSocket 处理
│   │   └── app.ts         # 应用入口
│   ├── migrations/         # 数据库迁移
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── services/      # API 服务
│   │   ├── store/         # Redux 状态管理
│   │   ├── types/         # TypeScript 类型
│   │   ├── utils/         # 工具函数
│   │   ├── router/        # 路由配置
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18.x 或更高版本
- MySQL 8.0
- npm 或 yarn

### 1. 数据库配置

```bash
# 创建数据库
mysql -u root -p
```

```sql
CREATE DATABASE trip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trip_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON trip.* TO 'trip_user'@'localhost';
FLUSH PRIVILEGES;
```

```bash
# 导入数据库表结构
mysql -u trip_user -p trip < backend/migrations/init.sql
```

### 2. 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改数据库配置等

# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
npm start
```

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，修改 API 地址

# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
```

访问 http://localhost:5173 查看应用。

---

## 部署指南（阿里云 ECS）

### 1. 服务器环境配置

购买阿里云 ECS 实例，推荐配置：
- 实例规格: 2核4GB
- 操作系统: Ubuntu 22.04 LTS
- 带宽: 3Mbps
- 系统盘: 40GB SSD

登录服务器：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MySQL 8.0
sudo apt install -y mysql-server
sudo mysql_secure_installation

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2（进程管理）
sudo npm install -g pm2
```

### 2. 数据库部署

```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE trip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trip_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON trip.* TO 'trip_user'@'localhost';
FLUSH PRIVILEGES;

# 退出 MySQL
EXIT;

# 导入数据库表结构（先上传 init.sql 到服务器）
mysql -u trip_user -p trip < init.sql
```

### 3. 后端部署

```bash
# 上传后端代码到服务器
# 方式1: 使用 scp
scp -r backend/ user@your-server:/var/www/trip/

# 方式2: 使用 git
mkdir -p /var/www/trip
cd /var/www/trip
git clone your-repo-url backend

# 进入后端目录
cd /var/www/trip/backend

# 安装依赖
npm install --production

# 创建环境变量文件
cp .env.example .env
nano .env
```

编辑 `.env` 文件：

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=trip_user
DB_PASSWORD=your_strong_password
DB_NAME=trip

# JWT 配置
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://your-domain.com
```

```bash
# 创建日志目录
mkdir -p logs

# 使用 PM2 启动后端
pm2 start npm --name "trip-backend" -- start
pm2 save
pm2 startup
```

### 4. 前端部署

```bash
# 上传前端代码
scp -r frontend/ user@your-server:/var/www/trip/

# 进入前端目录
cd /var/www/trip/frontend

# 安装依赖
npm install

# 构建前端
npm run build

# 创建环境变量文件
nano .env.production
```

编辑 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com
```

### 5. Nginx 配置

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/sites-available/trip
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /var/www/trip/frontend/dist;
    index index.html;

    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/trip /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. SSL/HTTPS 配置（可选但推荐）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书（自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 证书会自动续期
sudo certbot renew --dry-run
```

### 7. 防火墙配置

```bash
# 配置防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 8. 验证部署

```bash
# 检查服务状态
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status

# 查看后端日志
pm2 logs trip-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 测试 API
curl https://your-domain.com/api/health
```

---

## API 文档

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/verify | 实名认证 |
| PUT | /api/auth/profile | 更新个人资料 |
| PUT | /api/auth/password | 修改密码 |

### 乘客需求相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/passenger/publish | 发布需求（需认证） |
| GET | /api/passenger/list | 查询列表 |
| GET | /api/passenger/:id | 获取详情 |
| PUT | /api/passenger/:id | 更新需求（需认证） |
| DELETE | /api/passenger/:id | 取消需求（需认证） |
| GET | /api/passenger/my/requests | 我的需求（需认证） |

### 车主邀客相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/driver/publish | 发布邀客（需认证） |
| GET | /api/driver/list | 查询列表 |
| GET | /api/driver/:id | 获取详情 |
| PUT | /api/driver/:id | 更新邀客（需认证） |
| DELETE | /api/driver/:id | 取消邀客（需认证） |
| GET | /api/driver/my/invites | 我的邀客（需认证） |

### 聊天相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/chat/contacts | 获取联系人列表（需认证） |
| GET | /api/chat/messages/:userId | 获取消息历史（需认证） |
| PUT | /api/chat/messages/read/:userId | 标记消息已读（需认证） |
| GET | /api/chat/unread | 获取未读数量（需认证） |

### WebSocket 事件

| 事件 | 方向 | 描述 |
|------|------|------|
| message:send | 客户端→服务端 | 发送消息 |
| message:receive | 服务端→客户端 | 接收消息 |
| message:read | 双向 | 消息已读 |
| typing:start | 客户端→服务端 | 开始输入 |
| typing:stop | 客户端→服务端 | 停止输入 |
| typing:notify | 服务端→客户端 | 输入状态通知 |

---

## 开发说明

### 后端开发

```bash
cd backend
npm run dev  # 启动开发服务器，支持热重载
```

### 前端开发

```bash
cd frontend
npm run dev  # 启动开发服务器，默认端口 5173
```

---

## 许可证

MIT License
