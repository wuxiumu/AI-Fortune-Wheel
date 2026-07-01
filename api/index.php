<?php
/**
 * API 入口
 * 统一请求处理：CORS → 限流 → 路由分发
 */

// 错误处理
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// 加载配置
$config = require __DIR__ . '/config/config.php';

// 加载类
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/models/FileModel.php';
require_once __DIR__ . '/models/RedisModel.php';
require_once __DIR__ . '/models/ResultModel.php';
require_once __DIR__ . '/controllers/ResultController.php';
require_once __DIR__ . '/controllers/HotController.php';
require_once __DIR__ . '/controllers/StatsController.php';
require_once __DIR__ . '/controllers/I18nController.php';
require_once __DIR__ . '/controllers/ShareController.php';
require_once __DIR__ . '/controllers/FeedbackController.php';
require_once __DIR__ . '/controllers/StarsController.php';

// 初始化存储
FileModel::init($config['paths']);
RedisModel::init($config['redis']);

// CORS
Response::cors($config['cors']);

// 限流
if ($config['rate_limit']['enabled']) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip = explode(',', $ip)[0];
    $ip = trim($ip);
    $key = 'rate:' . md5($ip);
    $count = RedisModel::incr($key);
    if ($count === 1) {
        RedisModel::expire($key, $config['rate_limit']['window']);
    }
    if ($count > $config['rate_limit']['max']) {
        Response::fail('请求过于频繁，请稍后再试', 429);
    }
}

// 路由解析
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = '/' . trim($uri, '/');

// 移除 /api 前缀（支持 /api/xxx 和 /xxx 两种访问方式）
if (strpos($uri, '/api') === 0) {
    $uri = substr($uri, 4) ?: '/';
}

$routes = require __DIR__ . '/config/routes.php';
$handlers = $routes[$method] ?? [];

// 精确匹配
if (isset($handlers[$uri])) {
    $handler = $handlers[$uri];
    if (is_callable($handler)) {
        $handler();
        exit;
    }
    if (is_array($handler) && count($handler) === 2) {
        [$class, $action] = $handler;
        $class::$action();
        exit;
    }
}

// 参数路由（/xxx/{param}）
foreach ($handlers as $pattern => $handler) {
    $regex = preg_replace('/\{([^}]+)\}/', '(?P<$1>[^/]+)', $pattern);
    $regex = '#^' . $regex . '$#';
    if (preg_match($regex, $uri, $matches)) {
        // 提取参数
        $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
        if (is_callable($handler)) {
            $handler(...array_values($params));
            exit;
        }
        if (is_array($handler) && count($handler) === 2) {
            [$class, $action] = $handler;
            if (empty($params)) {
                $class::$action();
            } else {
                $class::$action(...array_values($params));
            }
            exit;
        }
    }
}

Response::notFound('接口不存在：' . $uri);
