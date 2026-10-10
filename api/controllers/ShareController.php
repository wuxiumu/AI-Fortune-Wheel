<?php
/**
 * 分享控制器
 * POST /api/share         记录分享行为
 * GET  /api/share/{id}    获取已保存的分享数据
 */
class ShareController
{
    /**
     * 记录分享
     */
    public static function create(): void
    {
        $body = Response::json();
        $data = $body['data'] ?? null;
        if (!$data || !is_array($data)) {
            Response::fail('缺少分享数据', 400);
            return;
        }

        // 生成唯一 ID
        $id = substr(md5(json_encode($data) . microtime(true)), 0, 10);
        $key = 'share:' . $id;

        RedisModel::set($key, $data, 30 * 86400); // 30 天过期
        RedisModel::incr('total_share');

        Response::ok([
            'id'  => $id,
            'url' => '/share/' . $id,
        ], '分享已保存');
    }

    /**
     * 获取分享数据
     */
    public static function get(string $id): void
    {
        $data = RedisModel::get('share:' . $id);
        if (!$data) {
            Response::notFound('分享内容不存在或已过期');
            return;
        }
        Response::ok($data);
    }
}
