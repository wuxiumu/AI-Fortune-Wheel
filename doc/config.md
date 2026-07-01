# 配置说明

## 全局配置（`js/config.js`）

修改 `js/config.js` 文件即可整站生效，无需改动其他代码。

### 站点基础

```js
const SITE_CONFIG = {
  domain: '51chigua.solutions',        // 主域名
  baseUrl: 'https://51chigua.solutions', // 完整 URL
  siteName: '吃瓜命理盘',                // 站点名称
  siteNameEn: 'Melon Destiny Wheel',   // 英文名称
  version: '1.1.0',
  author: '51chigua',
  year: new Date().getFullYear(),
  // ...
};
```

### TDK（SEO）

```js
tdk: {
  title: '吃瓜命理盘 · 东西双体系CP速测',
  description: '明星CP配对 · 绯闻缘分速测 · 五行/星座双解 · 仅供娱乐吃瓜',
  keywords: '吃瓜,命理,CP配对,星座配对,五行生肖'
}
```

### 社交账号

```js
social: {
  weibo:      { name: '微博',   handle: '@吃瓜命理盘', url: '#' },
  xiaohongshu:{ name: '小红书', handle: '@吃瓜命理盘', url: '#' },
  douyin:     { name: '抖音',   handle: '@吃瓜命理盘', url: '#' },
  bilibili:   { name: 'B站',    handle: '吃瓜命理盘官方', url: '#' }
}
```

### 联系方式

```js
contact: {
  business: 'business@51chigua.solutions',
  feedback: 'feedback@51chigua.solutions',
  legal:    'legal@51chigua.solutions',
  general:  'contact@51chigua.solutions'
}
```

### 功能开关

```js
features: {
  posterQR: true,        // 海报二维码
  nativeShare: true,     // 系统原生分享
  copyText: true,        // 复制文案
  wheelClick: true,      // 盘面点击选择
  wheelAnimation: true   // 转盘动画
}
```

## 后端配置（`api/config/config.php`）

```php
return [
  'app' => [
    'name'  => '吃瓜命理盘',
    'env'   => 'production',
    'debug' => false,
  ],
  'redis' => [
    'host'     => '127.0.0.1',
    'port'     => 6379,
    'password' => null,
    'db'       => 0,
    'prefix'   => '51chigua:',
  ],
  'rate_limit' => [
    'enabled' => true,
    'window'  => 60,  // 秒
    'max'     => 60,  // 请求数
  ],
];
```

## 启动配置

### 环境变量

```bash
# 服务器
APP_HOST=0.0.0.0
APP_PORT=8000

# 应用环境
APP_ENV=production
APP_DEBUG=false

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 启动命令

```bash
# 方式一：启动脚本（推荐）
./start.sh

# 方式二：自定义端口
APP_PORT=8080 php server.php

# 方式三：npm
npm start
```

## 数据文件

### 静态数据（`api/data/`）

- `east.json` — 十二地支生肖
- `west.json` — 十二星座
- `elements_east.json` — 五行元素配色
- `elements_west.json` — 四象元素配色
- `cross.json` — 东西互译文案
- `blurb.json` — 评语库
- `hot_cp.json` — 预置热门 CP
- `i18n/` — 多语言（zh/en/ja）

### 修改数据

直接编辑 JSON 文件即可，无需重启服务。

## 自定义域名示例

假设你要改为 `fortune.example.com`：

1. 编辑 `js/config.js`：
   ```js
   domain: 'fortune.example.com',
   baseUrl: 'https://fortune.example.com',
   siteName: ' fortune 盘',
   ```

2. 更新 TDK：
   ```js
   tdk: {
     title: 'fortune 盘 · 星座配对',
     description: '...',
     keywords: '...'
   }
   ```

3. 更新社交账号和联系方式

4. 保存文件，刷新页面即可生效

## 注意事项

- 修改 `js/config.js` 后需要刷新浏览器（或清除缓存）
- 修改 `api/data/*.json` 后立即生效
- 修改 `api/config/config.php` 后需要重启 PHP 服务
- 所有配置都是明文存储，不要存放敏感信息（如数据库密码）
