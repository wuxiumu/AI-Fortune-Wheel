# Nginx 配置说明

## 概述

本文档提供「吃瓜命理盘」项目的 Nginx 部署配置，包括：
- 前端静态文件服务
- PHP API 后端代理
- Redis 连接（可选）
- SSL/HTTPS 配置
- 性能优化

## 基础配置

### 1. 项目结构假设

```
/var/www/51chigua.solutions/
├── index.html              # 主页
├── server.php              # PHP 路由入口
├── css/                    # 样式文件
├── js/                     # JavaScript 文件
├── pages/                  # 子页面
├── api/                    # PHP 后端
│   ├── index.php
│   ├── controllers/
│   ├── models/
│   └── data/               # JSON 数据文件
└── assets/                 # 静态资源
```

### 2. 基础 Nginx 配置

```nginx
server {
    listen 80;
    server_name 51chigua.solutions www.51chigua.solutions;
    
    root /var/www/51chigua.solutions;
    index index.html;
    
    # 字符编码
    charset utf-8;
    
    # 日志
    access_log /var/log/nginx/51chigua.access.log;
    error_log /var/log/nginx/51chigua.error.log;
    
    # 包含配置
    include /etc/nginx/sites-available/51chigua-*.conf;
}
```

## 详细配置

### 静态文件配置 (`51chigua-static.conf`)

```nginx
# 静态文件缓存策略
location ~* \.(html|css|js|json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    # 缓存控制
    expires 7d;
    add_header Cache-Control "public, immutable";
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;
    gzip_proxied any;
    
    # 安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    try_files $uri =404;
}

# 首页
location = / {
    try_files /index.html =404;
}

# 子页面友好路由
location ~ ^/(about|faq|contact|disclaimer)$ {
    try_files /pages/$1.html =404;
}
```

### PHP API 配置 (`51chigua-api.conf`)

```nginx
# PHP API 路由
location /api/ {
    # PHP-FPM 配置
    try_files $uri /api/index.php?$query_string;
    
    # PHP 处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;  # 根据实际 PHP 版本调整
        fastcgi_index index.php;
        
        # FastCGI 参数
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param QUERY_STRING $query_string;
        fastcgi_param REQUEST_METHOD $request_method;
        fastcgi_param CONTENT_TYPE $content_type;
        fastcgi_param CONTENT_LENGTH $content_length;
        
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param DOCUMENT_URI $document_uri;
        fastcgi_param DOCUMENT_ROOT $document_root;
        fastcgi_param SERVER_PROTOCOL $server_protocol;
        fastcgi_param REQUEST_SCHEME $scheme;
        
        fastcgi_param GATEWAY_INTERFACE CGI/1.1;
        fastcgi_param SERVER_SOFTWARE nginx/$nginx_version;
        
        fastcgi_param REMOTE_ADDR $remote_addr;
        fastcgi_param REMOTE_PORT $remote_port;
        fastcgi_param SERVER_ADDR $server_addr;
        fastcgi_param SERVER_PORT $server_port;
        fastcgi_param SERVER_NAME $server_name;
        
        fastcgi_param HTTPS $https if_not_empty;
        
        # 性能优化
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        
        # 超时设置
        fastcgi_connect_timeout 60s;
        fastcgi_send_timeout 60s;
        fastcgi_read_timeout 60s;
    }
}

# 兼容旧 API 路径（/calc, /hot 等）
location ~ ^/(calc|hot|stats|i18n|share|history|feedback|stars)(/|$) {
    rewrite ^ /api/index.php last;
}
```

### PHP 路由脚本配置

由于项目使用 `server.php` 作为统一路由入口，需要特殊配置：

```nginx
# 使用 server.php 作为路由
location / {
    try_files $uri $uri/ /server.php?$query_string;
}

# PHP 处理（包括 server.php）
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
    fastcgi_index server.php;
    
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param QUERY_STRING $query_string;
    fastcgi_param REQUEST_METHOD $request_method;
    fastcgi_param CONTENT_TYPE $content_type;
    fastcgi_param CONTENT_LENGTH $content_length;
    
    fastcgi_param SCRIPT_NAME $fastcgi_script_name;
    fastcgi_param REQUEST_URI $request_uri;
    fastcgi_param DOCUMENT_URI $document_uri;
    fastcgi_param DOCUMENT_ROOT $document_root;
    fastcgi_param SERVER_PROTOCOL $server_protocol;
    fastcgi_param REQUEST_SCHEME $scheme;
    
    fastcgi_param GATEWAY_INTERFACE CGI/1.1;
    fastcgi_param SERVER_SOFTWARE nginx/$nginx_version;
    
    fastcgi_param REMOTE_ADDR $remote_addr;
    fastcgi_param REMOTE_PORT $remote_port;
    fastcgi_param SERVER_ADDR $server_addr;
    fastcgi_param SERVER_PORT $server_port;
    fastcgi_param SERVER_NAME $server_name;
    
    fastcgi_param HTTPS $https if_not_empty;
    
    fastcgi_buffer_size 128k;
    fastcgi_buffers 256 16k;
    fastcgi_busy_buffers_size 256k;
    fastcgi_temp_file_write_size 256k;
    
    fastcgi_connect_timeout 60s;
    fastcgi_send_timeout 60s;
    fastcgi_read_timeout 60s;
}

# 禁止访问敏感文件
location ~ /\.(ht|git|env) {
    deny all;
    return 404;
}

location ~* \.(md|log)$ {
    deny all;
    return 404;
}
```

### 限流配置 (`51chigua-ratelimit.conf`)

```nginx
# 限流区域定义（在 http 块中）
# limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;

# API 限流
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    limit_req_status 429;
    
    # ... PHP 配置同上
}
```

## 完整配置示例

### `/etc/nginx/sites-available/51chigua.solutions`

```nginx
server {
    listen 80;
    server_name 51chigua.solutions www.51chigua.solutions;
    
    # 重定向到 HTTPS（如果启用 SSL）
    # return 301 https://$server_name$request_uri;
    
    root /var/www/51chigua.solutions;
    index index.html;
    charset utf-8;
    
    access_log /var/log/nginx/51chigua.access.log;
    error_log /var/log/nginx/51chigua.error.log;
    
    # 静态文件
    location ~* \.(html|css|js|json|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
        gzip_min_length 1000;
        try_files $uri =404;
    }
    
    # 首页
    location = / {
        try_files /index.html =404;
    }
    
    # 子页面
    location ~ ^/(about|faq|contact|disclaimer)$ {
        try_files /pages/$1.html =404;
    }
    
    # 使用 server.php 路由
    location / {
        try_files $uri $uri/ /server.php?$query_string;
    }
    
    # PHP 处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index server.php;
        
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param QUERY_STRING $query_string;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param DOCUMENT_ROOT $document_root;
        fastcgi_param SERVER_PROTOCOL $server_protocol;
        fastcgi_param REQUEST_SCHEME $scheme;
        fastcgi_param HTTPS $https if_not_empty;
        
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        
        fastcgi_connect_timeout 60s;
        fastcgi_send_timeout 60s;
        fastcgi_read_timeout 60s;
    }
    
    # 安全
    location ~ /\.(ht|git|env) {
        deny all;
        return 404;
    }
    
    location ~* \.(md|log)$ {
        deny all;
        return 404;
    }
    
    # 安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

## SSL/HTTPS 配置

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d 51chigua.solutions -d www.51chigua.solutions
```

### SSL 配置示例

```nginx
server {
    listen 443 ssl http2;
    server_name 51chigua.solutions www.51chigua.solutions;
    
    root /var/www/51chigua.solutions;
    index index.html;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/51chigua.solutions/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/51chigua.solutions/privkey.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # ... 其余配置同上
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name 51chigua.solutions www.51chigua.solutions;
    return 301 https://$server_name$request_uri;
}
```

## 部署步骤

### 1. 安装依赖

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx php8.3-fpm php8.3-redis php8.3-mbstring

# CentOS/RHEL
sudo yum install nginx php-fpm php-redis php-mbstring
```

### 2. 配置 PHP-FPM

```bash
# 编辑 PHP-FPM 配置
sudo nano /etc/php/8.3/fpm/pool.d/www.conf

# 确保以下配置
user = www-data
group = www-data
listen = /var/run/php/php8.3-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

# 重启 PHP-FPM
sudo systemctl restart php8.3-fpm
```

### 3. 部署项目文件

```bash
# 创建目录
sudo mkdir -p /var/www/51chigua.solutions
sudo chown -R www-data:www-data /var/www/51chigua.solutions

# 上传项目文件
sudo rsync -av ./ /var/www/51chigua.solutions/

# 设置权限
sudo chmod -R 755 /var/www/51chigua.solutions
sudo chmod -R 775 /var/www/51chigua.solutions/api/cache
sudo chown -R www-data:www-data /var/www/51chigua.solutions/api/cache
```

### 4. 配置 Nginx

```bash
# 创建配置
sudo nano /etc/nginx/sites-available/51chigua.solutions
# 粘贴上述配置

# 启用站点
sudo ln -s /etc/nginx/sites-available/51chigua.solutions /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 5. 配置 Redis（可选）

```bash
# 安装 Redis
sudo apt install redis-server

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# 配置项目连接
# 编辑 api/config/config.php，设置 Redis 连接信息
```

## 性能优化

### Gzip 压缩（在 http 块中）

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

### 缓存策略

```nginx
# 静态资源长期缓存
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### 连接优化

```nginx
http {
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # worker 配置
    worker_processes auto;
    worker_connections 1024;
}
```

## 监控和日志

### 访问日志格式

```nginx
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  '$request_time';

access_log /var/log/nginx/51chigua.access.log custom;
```

### 错误监控

```bash
# 实时查看错误日志
tail -f /var/log/nginx/51chigua.error.log

# 查看访问统计
awk '{print $1}' /var/log/nginx/51chigua.access.log | sort | uniq -c | sort -rn
```

## 故障排查

### 常见问题

1. **502 Bad Gateway**
   - 检查 PHP-FPM 是否运行：`sudo systemctl status php8.3-fpm`
   - 检查 socket 权限：`ls -l /var/run/php/`

2. **403 Forbidden**
   - 检查文件权限：`sudo chown -R www-data:www-data /var/www/51chigua.solutions`
   - 检查 Nginx 配置中的 `deny` 规则

3. **API 返回空响应**
   - 检查 PHP 错误日志：`tail -f /var/log/php8.3-fpm.log`
   - 检查 Redis 连接：`redis-cli ping`

4. **静态文件 404**
   - 检查 `root` 路径是否正确
   - 检查 `try_files` 配置

### 测试命令

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx

# 测试 API
curl -X POST http://localhost/api/calc \
  -H "Content-Type: application/json" \
  -d '{"system":"east","a":0,"b":1}'
```

## 安全加固

### 防火墙配置

```bash
# UFW
sudo ufw allow 'Nginx Full'
sudo ufw enable

# firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 隐藏版本信息

```nginx
http {
    server_tokens off;
}
```

### 限制请求方法

```nginx
if ($request_method !~ ^(GET|POST|OPTIONS)$) {
    return 405;
}
```

## 参考资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [PHP-FPM 配置](https://www.php.net/manual/en/install.fpm.configuration.php)
- [Let's Encrypt](https://letsencrypt.org/)
- [Redis 配置](https://redis.io/docs/manual/config/)

---

**最后更新**：2026-06-30  
**适用版本**：Nginx 1.18+, PHP 8.3+, Redis 6.0+
