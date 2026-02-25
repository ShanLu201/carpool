# 拼车平台部署到阿里云详细步骤（含免费服务器申请）

## 一、阿里云免费服务器申请（ECS 试用）

1. 打开阿里云官网并登录账号。
2. 进入阿里云免费试用中心：`https://free.aliyun.com/`，找到 **云服务器 ECS 免费试用**。
3. 完成实名认证（个人/企业均可，按页面要求）。
4. 选择试用配置并创建实例，建议：
   - 地域：选择离目标用户更近的地域
   - 镜像：`Ubuntu 22.04 LTS`
   - 公网 IP：开启
   - 登录方式：密码或密钥（建议密钥）
   - 安全组：先放行 `22/80/443`（后续可按需调整）
5. 创建完成后记录：
   - ECS 公网 IP
   - 登录用户名（通常 `root`）
   - 登录密码或私钥

---

## 二、连接 ECS 并初始化环境

本地终端连接服务器：

```bash
ssh root@<你的ECS公网IP>
```

更新系统并安装基础工具：

```bash
apt update && apt upgrade -y
apt install -y git curl nginx
```

安装 Node.js 20 LTS：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

安装 PM2（管理后端进程）：

```bash
npm install -g pm2
pm2 -v
```

---

## 三、安装并配置 MySQL

安装 MySQL：

```bash
apt install -y mysql-server
systemctl enable mysql
systemctl start mysql
```

执行安全初始化：

```bash
mysql_secure_installation
```

创建数据库和业务账号：

```sql
CREATE DATABASE trip CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'trip_user'@'localhost' IDENTIFIED BY '请替换为强密码';
GRANT ALL PRIVILEGES ON trip.* TO 'trip_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 四、部署后端（Node.js + Express）

### 1）上传本地代码到 ECS（不使用 git clone）

你当前本地代码不是 Git 仓库，推荐用以下任一方式上传：

**方式 A：VS Code Remote-SSH（推荐）**
1. 本地 VS Code 安装 `Remote - SSH` 插件。
2. 连接到 ECS。
3. 将本地 `trip` 项目文件夹直接上传到服务器目录 `/var/www/trip`。

**方式 B：SCP 直接上传**
在本地终端执行（将本地目录压缩后上传更快）：

```bash
# 本地打包
cd <你的本地项目父目录>
tar -czf trip.tar.gz trip

# 上传到服务器
scp trip.tar.gz root@<你的ECS公网IP>:/var/www/

# 在服务器解压
ssh root@<你的ECS公网IP>
cd /var/www
tar -xzf trip.tar.gz
```

上传完成后进入后端目录：

```bash
cd /var/www/trip/backend
```

### 2）安装依赖并构建

```bash
npm install
npm run build
```

### 3）创建后端环境变量

在 `/var/www/trip/backend/.env` 填写：

```env
PORT=3000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=trip_user
DB_PASSWORD=请替换为强密码
DB_NAME=trip
JWT_SECRET=请替换为长随机字符串
```

### 4）执行数据库迁移

如果你是 SQL 迁移文件方式：

```bash
mysql -u trip_user -p trip < /var/www/trip/backend/migrations/你的迁移文件.sql
```

### 5）用 PM2 启动后端

```bash
cd /var/www/trip/backend
pm2 start dist/app.js --name trip-backend
pm2 save
pm2 startup
```

检查状态与日志：

```bash
pm2 status
pm2 logs trip-backend
```

---

## 五、部署前端（React + Vite）

### 1）构建前端

```bash
cd /var/www/trip/frontend
npm install
npm run build
```

构建产物默认目录：`/var/www/trip/frontend/dist`

### 2）配置 Nginx 托管前端并反代后端

创建配置文件 `/etc/nginx/sites-available/trip.conf`：

```nginx
server {
    listen 80;
    server_name <你的域名或ECS公网IP>;

    root /var/www/trip/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

  前端生产环境变量（关键）：

  frontend/.env.production
```
  VITE_API_BASE_URL=/api
  VITE_WS_URL=ws://123.57.142.219
```

  然后重建前端：

  cd /var/www/trip/frontend
```
  npm run build
  systemctl reload nginx
```

启用站点并重启 Nginx：

```bash
ln -s /etc/nginx/sites-available/trip.conf /etc/nginx/sites-enabled/trip.conf
nginx -t
systemctl restart nginx
```

---

## 六、配置 HTTPS（推荐）

如果你有域名并已解析到 ECS 公网 IP：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d <你的域名>
```

验证证书续期：

```bash
certbot renew --dry-run
```

---

## 七、阿里云安全组设置

在 ECS 安全组入方向开放：

- `22`（SSH）
- `80`（HTTP）
- `443`（HTTPS）

说明：如果后端只通过 Nginx 反向代理，不建议对公网开放 `3000`。

---

## 八、配置成功后的主页 URL 是什么

- 如果你用 **ECS 公网 IP** 访问：
  - `http://<你的ECS公网IP>`
- 如果你绑定了域名但还没配 HTTPS：
  - `http://<你的域名>`
- 如果你已配置 HTTPS（证书成功签发）：
  - `https://<你的域名>`

示例：
- `http://47.XX.XX.XX`
- `https://carpool.example.com`

## 九、上线检查清单

1. 首页可访问。
2. 注册、登录可用。
3. 乘客发布、车主发布可用。
4. 列表显示发布者用户名（`real_name`）。
5. 仅 `status=2` 的记录可评价。
6. 个人中心可查看“我收到的评价”。
7. 聊天（Socket.IO）连接正常。
8. 重启服务器后 Nginx 和 PM2 自动恢复。

---

## 十、常用运维命令

```bash
# 查看后端日志
pm2 logs trip-backend

# 重启后端
pm2 restart trip-backend

# 查看 Nginx 状态
systemctl status nginx

# 重载 Nginx
nginx -t && systemctl reload nginx

# 查看监听端口
ss -lntp
```
