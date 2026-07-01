<?php
/**
 * 热门 CP 控制器
 * GET /api/hot         获取热门配对
 * POST /api/hot/incr   增加热度
 */
class HotController
{
    /**
     * 热门 CP 列表
     */
    public static function list(): void
    {
        $count = (int) Response::get('count', 10);
        $count = max(1, min(50, $count));
        $sys   = Response::get('system', '');

        // 合并预置热门 + 实时热门
        $preset = FileModel::dataGet('hot_cp') ?: [];
        $realtime = RedisModel::zTop('hot_cp', $count * 2);

        // 合并去重
        $seen = [];
        $merged = [];

        // 预置数据（带权重）
        foreach ($preset as $item) {
            if ($sys && ($item['system'] ?? '') !== $sys) continue;
            $key = ($item['system'] ?? '') . ':' . ($item['a'] ?? 0) . '_' . ($item['b'] ?? 0);
            if (isset($seen[$key])) continue;
            $seen[$key] = true;
            $merged[] = [
                'system' => $item['system'] ?? 'east',
                'a'      => (int) ($item['a'] ?? 0),
                'b'      => (int) ($item['b'] ?? 0),
                'nameA'  => $item['nameA'] ?? '',
                'nameB'  => $item['nameB'] ?? '',
                'reason' => $item['reason'] ?? '',
                'heat'   => (int) ($item['heat'] ?? 100),
                'preset' => true,
            ];
        }

        // 实时热度
        foreach ($realtime as $row) {
            $member = $row['member'];
            if (isset($seen[$member])) continue;
            $seen[$member] = true;
            [$sysKey, $pairKey] = explode(':', $member, 2);
            [$a, $b] = explode('_', $pairKey);
            $merged[] = [
                'system' => $sysKey,
                'a'      => (int) $a,
                'b'      => (int) $b,
                'nameA'  => '',
                'nameB'  => '',
                'reason' => '',
                'heat'   => $row['score'],
                'preset' => false,
            ];
        }

        // 按热度排序，截取
        usort($merged, fn($x, $y) => $y['heat'] - $x['heat']);
        $merged = array_slice($merged, 0, $count);

        Response::ok([
            'list'  => $merged,
            'total' => count($merged),
        ]);
    }

    /**
     * 增加热度
     */
    public static function incr(): void
    {
        $body = Response::json();
        $sys = $body['system'] ?? 'east';
        $a   = (int) ($body['a'] ?? -1);
        $b   = (int) ($body['b'] ?? -1);
        if ($a < 0 || $a > 11 || $b < 0 || $b > 11) {
            Response::fail('参数非法', 400);
            return;
        }
        $key = $sys . ':' . min($a, $b) . '_' . max($a, $b);
        RedisModel::zAdd('hot_cp', 1, $key);
        Response::ok(['heat' => RedisModel::incr('heat:' . $key)]);
    }
}
