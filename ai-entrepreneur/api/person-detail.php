<?php
/**
 * AI 名人详情 API
 * 根据名称返回单个名人详情
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// 获取名称参数
$name = isset($_GET['name']) ? $_GET['name'] : '';

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => '缺少 name 参数'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 数据文件路径
$dataFile = __DIR__ . '/../data/ai_personalities_zh.md';

if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => '数据文件不存在'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 读取 Markdown 文件
$content = file_get_contents($dataFile);

// 解析 Markdown
$personalities = parsePersonalities($content);

// 查找指定名人
$person = null;
foreach ($personalities as $p) {
    if ($p['name'] === $name) {
        $person = $p;
        break;
    }
}

if (!$person) {
    http_response_code(404);
    echo json_encode(['error' => '未找到该名人'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 获取相关推荐（同分类的其他名人）
$related = array_filter($personalities, function($p) use ($person) {
    return $p['category'] === $person['category'] && $p['name'] !== $person['name'];
});
$related = array_slice(array_values($related), 0, 3);

// 输出 JSON
echo json_encode([
    'success' => true,
    'data' => $person,
    'related' => $related
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

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
