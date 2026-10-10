<?php
/**
 * 统一 JSON 响应工具
 */
class Response
{
    /**
     * 成功响应
     */
    public static function ok($data = null, string $message = 'ok'): void
    {
        self::send(200, [
            'code'    => 0,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    /**
     * 错误响应
     */
    public static function fail(string $message, int $httpCode = 400, $data = null): void
    {
        self::send($httpCode, [
            'code'    => -1,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    /**
     * 404
     */
    public static function notFound(string $message = 'Not Found'): void
    {
        self::fail($message, 404);
    }

    /**
     * 发送 JSON
     */
    private static function send(int $httpCode, array $body): void
    {
        http_response_code($httpCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * 读取 JSON body
     */
    public static function json(): array
    {
        $raw = file_get_contents('php://input');
        if (!$raw) return [];
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    /**
     * 读取 GET 参数（带默认值）
     */
    public static function get(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * 设置 CORS
     */
    public static function cors(array $config): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $allowed = $config['allowed_origins'] ?? ['*'];
        if (in_array('*', $allowed) || in_array($origin, $allowed)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        header('Access-Control-Allow-Methods: ' . implode(', ', $config['allowed_methods']));
        header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
        header('Access-Control-Max-Age: ' . $config['max_age']);
        header('Access-Control-Allow-Credentials: true');

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
