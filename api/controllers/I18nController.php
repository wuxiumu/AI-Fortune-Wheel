<?php
/**
 * 国际化控制器
 * GET /api/i18n/:lang  获取指定语言文案
 * GET /api/i18n        获取支持的语言列表
 */
class I18nController
{
    private static array $supported = ['zh', 'en', 'ja'];
    private static string $default = 'zh';

    /**
     * 语言列表
     */
    public static function langs(): void
    {
        Response::ok([
            'supported' => self::$supported,
            'default'   => self::$default,
        ]);
    }

    /**
     * 获取文案
     */
    public static function get(string $lang): void
    {
        $lang = strtolower(trim($lang));
        if (!in_array($lang, self::$supported)) {
            $lang = self::$default;
        }
        $data = FileModel::dataGet("i18n/{$lang}");
        if (!$data) {
            // 兜底：加载中文
            $data = FileModel::dataGet('i18n/' . self::$default) ?: [];
        }
        Response::ok([
            'lang' => $lang,
            'data' => $data,
        ]);
    }

    /**
     * 浏览器首选语言检测
     */
    public static function detect(): string
    {
        $accept = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
        foreach (self::$supported as $lang) {
            if (stripos($accept, $lang) !== false) return $lang;
        }
        return self::$default;
    }
}
