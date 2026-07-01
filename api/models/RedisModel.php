<?php
/**
 * Redis 操作封装
 * - 自动重连失败时降级到文件缓存
 * - 统一的 key 前缀
 */
class RedisModel
{
    private static ?Redis $instance = null;
    private static bool $available = false;
    private static array $config = [];
    private static int $downTtl = 60;

    private static function downFlagFile(): string
    {
        return __DIR__ . '/../cache/redis_down.flag';
    }

    private static function markDown(): void
    {
        @touch(self::downFlagFile());
    }

    private static function clearDown(): void
    {
        $file = self::downFlagFile();
        if (is_file($file)) {
            @unlink($file);
        }
    }

    private static function isRecentlyDown(): bool
    {
        $file = self::downFlagFile();
        return is_file($file) && (time() - filemtime($file)) < self::$downTtl;
    }

    /**
     * 初始化连接
     */
    public static function init(array $config): void
    {
        self::$config = $config;
        if (!class_exists('Redis')) {
            self::$available = false;
            return;
        }
        if (self::isRecentlyDown()) {
            self::$available = false;
            return;
        }
        try {
            $r = new Redis();
            $r->connect($config['host'], $config['port'], $config['timeout']);
            if (!empty($config['password'])) {
                $r->auth($config['password']);
            }
            $r->select($config['db']);
            self::$instance = $r;
            self::$available = true;
            self::clearDown();
        } catch (Exception $e) {
            self::$available = false;
            self::markDown();
            self::logWarn('Redis connect failed: ' . $e->getMessage());
        }
    }

    /**
     * 是否可用
     */
    public static function available(): bool
    {
        return self::$available;
    }

    /**
     * 完整 key（加前缀）
     */
    private static function k(string $key): string
    {
        return (self::$config['prefix'] ?? '') . $key;
    }

    /**
     * GET
     */
    public static function get(string $key)
    {
        if (!self::$available) return FileModel::cacheGet($key);
        try {
            $val = self::$instance->get(self::k($key));
            if ($val === false) return FileModel::cacheGet($key);
            $decoded = json_decode($val, true);
            return $decoded !== null ? $decoded : $val;
        } catch (Exception $e) {
            return FileModel::cacheGet($key);
        }
    }

    /**
     * SET（带过期）
     */
    public static function set(string $key, $value, int $ttl = 0): bool
    {
        $encoded = is_string($value) || is_numeric($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);
        if (self::$available) {
            try {
                if ($ttl > 0) {
                    self::$instance->setex(self::k($key), $ttl, $encoded);
                } else {
                    self::$instance->set(self::k($key), $encoded);
                }
            } catch (Exception $e) {
                self::logWarn('Redis set failed: ' . $e->getMessage());
            }
        }
        return FileModel::cacheSet($key, $value, $ttl);
    }

    /**
     * INCR（热度计数）
     */
    public static function incr(string $key): int
    {
        if (self::$available) {
            try {
                return self::$instance->incr(self::k($key));
            } catch (Exception $e) {
                // 降级到文件
            }
        }
        return FileModel::counterIncr($key);
    }

    /**
     * ZADD（有序集合）
     */
    public static function zAdd(string $key, float $score, string $member): bool
    {
        if (self::$available) {
            try {
                return self::$instance->zAdd(self::k($key), $score, $member);
            } catch (Exception $e) {
                self::logWarn('Redis zAdd failed: ' . $e->getMessage());
            }
        }
        return FileModel::sortedAdd($key, $member, $score);
    }

    /**
     * ZRANGEBYSCORE 倒序
     */
    public static function zTop(string $key, int $count = 10): array
    {
        if (self::$available) {
            try {
                $result = self::$instance->zRevRange(self::k($key), 0, $count - 1, true);
                if (is_array($result)) {
                    $list = [];
                    foreach ($result as $member => $score) {
                        $list[] = ['member' => $member, 'score' => (int) $score];
                    }
                    return $list;
                }
            } catch (Exception $e) {
                self::logWarn('Redis zTop failed: ' . $e->getMessage());
            }
        }
        return FileModel::sortedTop($key, $count);
    }

    /**
     * 设置过期
     */
    public static function expire(string $key, int $ttl): void
    {
        if (self::$available) {
            try {
                self::$instance->expire(self::k($key), $ttl);
            } catch (Exception $e) { /* 忽略 */ }
        }
    }

    private static function logWarn(string $msg): void
    {
        error_log('[51chigua] ' . $msg);
    }
}
