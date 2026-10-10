<?php
/**
 * 反馈控制器
 * POST /api/feedback  提交用户反馈
 */
class FeedbackController
{
    public static function create(): void
    {
        $body = Response::json();
        $type = trim($body['type'] ?? 'suggestion');
        $content = trim($body['content'] ?? '');
        $contact = trim($body['contact'] ?? '');

        if (!$content || strlen($content) < 5) {
            Response::fail('反馈内容至少 5 个字', 400);
            return;
        }
        if (strlen($content) > 1000) {
            Response::fail('反馈内容过长（最多 1000 字）', 400);
            return;
        }

        $feedback = [
            'id'       => uniqid('fb_'),
            'type'     => in_array($type, ['bug', 'suggestion', 'other']) ? $type : 'other',
            'content'  => $content,
            'contact'  => $contact,
            'ua'       => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ip'       => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '',
            'time'     => date('c'),
        ];

        // 写入文件存储（按日期分文件）
        $date = date('Y-m-d');
        $file = FileModel::dataGet("feedback/{$date}") ?: [];
        $file[] = $feedback;
        FileModel::dataSet("feedback/{$date}", $file);

        RedisModel::incr('total_feedback');

        Response::ok(['id' => $feedback['id']], '反馈已收到，感谢！');
    }
}
