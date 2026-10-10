<?php
/**
 * 结果计算 API 控制器
 * POST /api/calc  计算配对结果
 */
class ResultController
{
    public static function calc(): void
    {
        $body = Response::json();
        $sys  = $body['system'] ?? 'east';
        $a    = (int) ($body['a'] ?? -1);
        $b    = (int) ($body['b'] ?? -1);
        $nameA = trim($body['nameA'] ?? '');
        $nameB = trim($body['nameB'] ?? '');

        // 参数校验
        if (!in_array($sys, ['east', 'west'])) {
            Response::fail('system 参数非法', 400);
            return;
        }
        if ($a < 0 || $a > 11 || $b < 0 || $b > 11) {
            Response::fail('a/b 需在 0-11 之间', 400);
            return;
        }

        $result = ResultModel::calc($sys, $a, $b, $nameA, $nameB);

        // 增加热度
        $pairKey = $sys . ':' . min($a, $b) . '_' . max($a, $b);
        RedisModel::zAdd('hot_cp', 1, $pairKey);
        RedisModel::incr('total_calc');

        // 记录到历史（7 天）
        $historyKey = 'history:' . substr(md5($pairKey . time()), 0, 8);
        RedisModel::set($historyKey, $result, 7 * 86400);

        Response::ok($result);
    }

    /**
     * 获取历史结果
     * GET /api/history/:id
     */
    public static function history(string $id): void
    {
        $result = RedisModel::get('history:' . $id);
        if (!$result) {
            Response::notFound('历史记录不存在或已过期');
            return;
        }
        Response::ok($result);
    }

    /**
     * 全站统计
     * GET /api/stats
     */
    public static function stats(): void
    {
        $total = RedisModel::get('total_calc');
        if (!$total) $total = 0;
        $todayKey = 'today:' . date('Ymd');
        $today = RedisModel::get($todayKey);
        if (!$today) $today = 0;
        Response::ok([
            'total' => (int) $total,
            'today' => (int) $today,
        ]);
    }
}
