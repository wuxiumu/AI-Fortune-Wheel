<?php
/**
 * 文件存储模型（Redis 降级方案 + 静态数据读写）
 * - cache/: 缓存目录（Redis 不可用时启用）
 * - data/: 静态数据目录（JSON 配置文件）
 */
class FileModel
{
    private static string $cacheDir = '';
    private static string $dataDir = '';

    public static function init(array $paths): void
    {
        self::$cacheDir = rtrim($paths['cache'] ?? __DIR__ . '/../cache', '/');
        self::$dataDir  = rtrim($paths['data']  ?? __DIR__ . '/../data',  '/');

        if (!is_dir(self::$cacheDir)) @mkdir(self::$cacheDir, 0755, true);
        $cacheSub = self::$cacheDir . '/kv';
        if (!is_dir($cacheSub)) @mkdir($cacheSub, 0755, true);
        $cacheSub = self::$cacheDir . '/counters';
        if (!is_dir($cacheSub)) @mkdir($cacheSub, 0755, true);
        $cacheSub = self::$cacheDir . '/sorted';
        if (!is_dir($cacheSub)) @mkdir($cacheSub, 0755, true);
    }

    /* ---------- 静态数据（JSON） ---------- */

    /**
     * 读取静态 JSON 数据文件
     */
    public static function dataGet(string $name): ?array
    {
        $file = self::$dataDir . '/' . $name . '.json';
        if (!is_file($file)) return null;
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        return is_array($data) ? $data : null;
    }

    /**
     * 写入静态 JSON 数据文件（带文件锁）
     */
    public static function dataSet(string $name, $data): bool
    {
        $file = self::$dataDir . '/' . $name . '.json';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        return file_put_contents($file, $json, LOCK_EX) !== false;
    }

    /* ---------- KV 缓存（Redis 降级） ---------- */

    public static function cacheGet(string $key)
    {
        $file = self::$cacheDir . '/kv/' . self::safeKey($key) . '.json';
        if (!is_file($file)) return null;
        $content = @file_get_contents($file);
        if ($content === false) return null;
        $wrapper = json_decode($content, true);
        if (!is_array($wrapper)) return null;
        // 检查过期
        if (!empty($wrapper['expire']) && $wrapper['expire'] < time()) {
            @unlink($file);
            return null;
        }
        return $wrapper['value'] ?? null;
    }

    public static function cacheSet(string $key, $value, int $ttl = 0): bool
    {
        $file = self::$cacheDir . '/kv/' . self::safeKey($key) . '.json';
        $wrapper = [
            'value'  => $value,
            'expire' => $ttl > 0 ? time() + $ttl : 0,
        ];
        $json = json_encode($wrapper, JSON_UNESCAPED_UNICODE);
        return file_put_contents($file, $json, LOCK_EX) !== false;
    }

    /* ---------- 计数器（热度统计） ---------- */

    public static function counterIncr(string $key): int
    {
        $file = self::$cacheDir . '/counters/' . self::safeKey($key) . '.txt';
        clearstatcache(true, $file);
        $fp = fopen($file, 'c+');
        if (!$fp) return 0;
        flock($fp, LOCK_EX);
        $val = (int) trim(fread($fp, 32) ?: '0');
        $val++;
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, (string) $val);
        flock($fp, LOCK_UN);
        fclose($fp);
        return $val;
    }

    public static function counterGet(string $key): int
    {
        $file = self::$cacheDir . '/counters/' . self::safeKey($key) . '.txt';
        if (!is_file($file)) return 0;
        return (int) trim(file_get_contents($file) ?: '0');
    }

    /* ---------- 有序集合（排行榜） ---------- */

    public static function sortedAdd(string $key, string $member, float $score): bool
    {
        $file = self::$cacheDir . '/sorted/' . self::safeKey($key) . '.json';
        $data = is_file($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
        $data[$member] = $score;
        return file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
    }

    public static function sortedTop(string $key, int $count): array
    {
        $file = self::$cacheDir . '/sorted/' . self::safeKey($key) . '.json';
        if (!is_file($file)) return [];
        $data = json_decode(file_get_contents($file), true);
        if (!is_array($data)) return [];
        arsort($data);
        $result = [];
        $i = 0;
        foreach ($data as $member => $score) {
            if ($i++ >= $count) break;
            $result[] = ['member' => $member, 'score' => (int) $score];
        }
        return $result;
    }

    /**
     * 安全文件名
     */
    private static function safeKey(string $key): string
    {
        return preg_replace('/[^a-zA-Z0-9_\-]/', '_', $key);
    }
}
