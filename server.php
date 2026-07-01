<?php
/**
 * 统一启动脚本
 * 用 PHP 内置服务器同时服务前端静态文件 + 后端 API
 *
 * 启动方式：
 *   php server.php
 *   或
 *   php -S localhost:8000 server.php
 */

// ---------- 配置 ----------
$host = getenv('APP_HOST') ?: '0.0.0.0';
$port = getenv('APP_PORT') ?: 8000;

// ---------- 解析请求 ----------
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = '/' . ltrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// ---------- 静态文件 ----------
// 允许的静态文件扩展名
$staticExt = ['html', 'css', 'js', 'json', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot', 'map'];

// 请求文件路径
$reqFile = __DIR__ . $uri;

// MIME 类型
function mime_type(string $ext): string {
    $map = [
        'html' => 'text/html; charset=utf-8',
        'css'  => 'text/css; charset=utf-8',
        'js'   => 'application/javascript; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'eot'  => 'application/vnd.ms-fontobject',
        'map'  => 'application/json',
    ];
    return $map[$ext] ?? 'application/octet-stream';
}

// ---------- ai-entrepreneur/data/*.json 静态数据（直出） ----------
if (strpos($uri, '/ai-entrepreneur/data/') === 0) {
    $dataFile = __DIR__ . $uri;
    if (is_file($dataFile) && strtolower(pathinfo($dataFile, PATHINFO_EXTENSION)) === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=3600');
        readfile($dataFile);
        return;
    }
}

// ---------- api/data/*.json 静态数据（直出，不走 PHP API / Redis） ----------
if (strpos($uri, '/api/data/') === 0) {
    $dataFile = __DIR__ . $uri;
    if (is_file($dataFile) && strtolower(pathinfo($dataFile, PATHINFO_EXTENSION)) === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: public, max-age=3600');
        readfile($dataFile);
        return;
    }
}

// ---------- API 路由 ----------
if (strpos($uri, '/api') === 0 || strpos($uri, '/calc') === 0
    || strpos($uri, '/hot') === 0 || strpos($uri, '/stats') === 0
    || strpos($uri, '/i18n') === 0 || strpos($uri, '/share') === 0
    || strpos($uri, '/history') === 0 || strpos($uri, '/feedback') === 0
    || strpos($uri, '/stars') === 0) {
    // 转发到 API 入口
    require __DIR__ . '/api/index.php';
    return;
}

// ---------- 静态文件服务 ----------
if (is_file($reqFile)) {
    $ext = strtolower(pathinfo($reqFile, PATHINFO_EXTENSION));

    // PHP 文件直接执行
    if ($ext === 'php') {
        require $reqFile;
        return;
    }

    if (in_array($ext, $staticExt)) {
        header('Content-Type: ' . mime_type($ext));
        
        // 根据文件类型设置不同的缓存策略
        if (in_array($ext, ['css', 'js'])) {
            // CSS/JS 缓存 1 天，因为它们可能会被更新
            header('Cache-Control: public, max-age=86400');
        } elseif (in_array($ext, ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'])) {
            // 图片和字体缓存 30 天
            header('Cache-Control: public, max-age=2592000, immutable');
        } else {
            // 其他文件缓存 1 小时
            header('Cache-Control: public, max-age=3600');
        }
        
        // 添加 ETag 支持
        $etag = md5_file($reqFile);
        header("ETag: \"$etag\"");
        
        // 如果客户端有缓存且未过期，返回 304
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH'], '"') === $etag) {
            http_response_code(304);
            return;
        }
        
        readfile($reqFile);
        return;
    }
}

// ---------- 根路径 → index.html ----------
if ($uri === '/' || $uri === '') {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/index.html');
    return;
}

// ---------- 子目录的 index.html ----------
// /ai-entrepreneur/ → ai-entrepreneur/index.html
$subDir = rtrim($uri, '/');
$subDirFile = __DIR__ . $subDir . '/index.html';
if (is_file($subDirFile)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($subDirFile);
    return;
}

// ---------- pages/*.html 友好路由 ----------
// /about → pages/about.html
// /faq   → pages/faq.html
$pageFile = __DIR__ . '/pages/' . basename($uri) . '.html';
if (is_file($pageFile)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($pageFile);
    return;
}

// ---------- 404 ----------
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>404</title>';
echo '<style>body{font-family:system-ui;background:#0c0a1d;color:#f3effc;display:grid;place-items:center;height:100vh;margin:0}';
echo '.box{text-align:center}.emoji{font-size:80px}h1{font-size:28px;margin:20px 0 10px}p{color:#b3acd6}a{color:#ffd56b}</style>';
echo '</head><body><div class="box">';
echo '<div class="emoji">🍉</div>';
echo '<h1>404 · 瓜没找到</h1>';
echo '<p>这个页面不存在，回首页吃瓜吧</p>';
echo '<p><a href="/">← 回到首页</a></p>';
echo '</div></body></html>';
