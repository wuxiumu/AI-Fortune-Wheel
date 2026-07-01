<?php
/**
 * AI 名人 API
 * 优先读 JSON 缓存，避免每次解析 Markdown
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=300');

$dataFile = __DIR__ . '/../data/ai_personalities_zh.md';
$cacheFile = __DIR__ . '/../data/personalities.json';

if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => '数据文件不存在'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (is_file($cacheFile) && filemtime($cacheFile) >= filemtime($dataFile)) {
    readfile($cacheFile);
    exit;
}

$content = file_get_contents($dataFile);
$personalities = parsePersonalities($content);
$output = json_encode([
    'success' => true,
    'count' => count($personalities),
    'data' => $personalities
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

file_put_contents($cacheFile, $output, LOCK_EX);
echo $output;

/**
 * 解析名人数据
 */
function parsePersonalities($text) {
    $personalities = [];
    $sections = preg_split('/^## /m', $text);

    foreach ($sections as $section) {
        if (strpos($section, 'AI 名人数据库') === 0 || empty(trim($section))) {
            continue;
        }

        $lines = explode("\n", $section);
        $category = trim($lines[0]);

        $currentPerson = null;
        foreach ($lines as $line) {
            if (strpos($line, '### ') === 0) {
                if ($currentPerson) {
                    $personalities[] = $currentPerson;
                }
                $currentPerson = [
                    'name' => trim(str_replace('### ', '', $line)),
                    'category' => $category,
                    'company' => '',
                    'role' => '',
                    'birth' => '',
                    'zodiac' => '',
                    'constellation' => '',
                    'tags' => '',
                    'bio' => '',
                    'status' => 'active'
                ];
            } elseif ($currentPerson && strpos($line, '- **') === 0) {
                if (preg_match('/- \*\*(.+?)\*\*: (.+)/', $line, $matches)) {
                    $key = $matches[1];
                    $value = $matches[2];
                    switch ($key) {
                        case '公司': $currentPerson['company'] = $value; break;
                        case '职位': $currentPerson['role'] = $value; break;
                        case '生日': $currentPerson['birth'] = $value; break;
                        case '星座': $currentPerson['zodiac'] = $value; break;
                        case '生肖': $currentPerson['constellation'] = $value; break;
                        case '标签': $currentPerson['tags'] = $value; break;
                        case '简介': $currentPerson['bio'] = $value; break;
                        case '状态': $currentPerson['status'] = $value; break;
                    }
                }
            }
        }

        if ($currentPerson) {
            $personalities[] = $currentPerson;
        }
    }

    return $personalities;
}
