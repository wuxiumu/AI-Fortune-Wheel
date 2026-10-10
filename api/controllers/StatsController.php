<?php
/**
 * 统计控制器
 * GET /api/stats 全站统计
 */
class StatsController
{
    public static function index(): void
    {
        $total = RedisModel::get('total_calc');
        $todayKey = 'today:' . date('Ymd');
        $today = RedisModel::get($todayKey);

        Response::ok([
            'total' => (int) ($total ?: 0),
            'today' => (int) ($today ?: 0),
        ]);
    }
}
