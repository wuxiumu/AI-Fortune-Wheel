<?php
/**
 * 全局配置
 */
return [
    // 应用
    'app' => [
        'name'    => '吃瓜命理盘',
        'version' => '1.1.0',
        'env'     => getenv('APP_ENV') ?: 'production',
        'debug'   => (bool) getenv('APP_DEBUG'),
    ],

    // Redis 配置
    'redis' => [
        'host'     => getenv('REDIS_HOST') ?: '127.0.0.1',
        'port'     => (int) (getenv('REDIS_PORT') ?: 6379),
        'password' => getenv('REDIS_PASSWORD') ?: null,
        'db'       => (int) (getenv('REDIS_DB') ?: 0),
        'timeout'  => 0.5,
        'prefix'   => '51chigua:',
    ],

    // 文件存储路径
    'paths' => [
        'data'   => __DIR__ . '/../data',
        'cache'  => __DIR__ . '/../cache',
        'logs'   => __DIR__ . '/../cache/logs',
    ],

    // 跨域
    'cors' => [
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
        'max_age'         => 86400,
    ],

    // 限流
    'rate_limit' => [
        'enabled'  => true,
        'window'   => 60,    // 窗口（秒）
        'max'      => 60,    // 窗口内最大请求
    ],
];
