<?php
/**
 * 路由表
 * 结构：method => path => handler
 */
return [
    'GET' => [
        '/'                  => fn() => Response::ok(['app' => '51chigua', 'version' => '1.1.0']),
        '/hot'               => [HotController::class, 'list'],
        '/hot/list'          => [HotController::class, 'list'],
        '/stats'             => [StatsController::class, 'index'],
        '/i18n'              => [I18nController::class, 'langs'],
        '/i18n/{lang}'       => [I18nController::class, 'get'],
        '/history/{id}'      => [ResultController::class, 'history'],
        '/share/{id}'        => [ShareController::class, 'get'],
        '/stars'             => [StarsController::class, 'list'],
        '/stars/search'      => [StarsController::class, 'search'],
    ],
    'POST' => [
        '/calc'              => [ResultController::class, 'calc'],
        '/hot/incr'          => [HotController::class, 'incr'],
        '/share'             => [ShareController::class, 'create'],
        '/feedback'          => [FeedbackController::class, 'create'],
    ],
];
