<?php
/**
 * AI 企业详情 API
 * 根据名称返回单个企业详情
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
$dataFile = __DIR__ . '/../data/ai_companies_zh.md';

if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => '数据文件不存在'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 读取 Markdown 文件
$content = file_get_contents($dataFile);

// 解析 Markdown
$companies = parseCompanies($content);

// 查找指定企业
$company = null;
foreach ($companies as $c) {
    if ($c['name'] === $name) {
        $company = $c;
        break;
    }
}

if (!$company) {
    http_response_code(404);
    echo json_encode(['error' => '未找到该企业'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 获取相关推荐（同行业的其他企业）
$related = array_filter($companies, function($c) use ($company) {
    return $c['industry'] === $company['industry'] && $c['name'] !== $company['name'];
});
$related = array_slice(array_values($related), 0, 3);

// 输出 JSON
echo json_encode([
    'success' => true,
    'data' => $company,
    'related' => $related
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

/**
 * 解析企业数据
 */
function parseCompanies($text) {
    $companies = [];
    $sections = preg_split('/^## /m', $text);

    foreach ($sections as $section) {
        if (strpos($section, 'AI 企业数据库') === 0 || empty(trim($section))) {
            continue;
        }

        $lines = explode("\n", $section);
        $industry = trim($lines[0]);

        $currentCompany = null;
        foreach ($lines as $line) {
            if (strpos($line, '### ') === 0) {
                if ($currentCompany) {
                    $companies[] = $currentCompany;
                }
                $currentCompany = [
                    'name' => trim(str_replace('### ', '', $line)),
                    'industry' => $industry,
                    'country' => '',
                    'founded' => '',
                    'valuation' => '',
                    'products' => '',
                    'industryTags' => '',
                    'founders' => '',
                    'description' => '',
                    'stage' => '',
                    'status' => 'active'
                ];
            } elseif ($currentCompany && strpos($line, '- **') === 0) {
                if (preg_match('/- \*\*(.+?)\*\*: (.+)/', $line, $matches)) {
                    $key = $matches[1];
                    $value = $matches[2];
                    switch ($key) {
                        case '国家': $currentCompany['country'] = $value; break;
                        case '成立时间': $currentCompany['founded'] = $value; break;
                        case '估值': $currentCompany['valuation'] = $value; break;
                        case '主要产品': $currentCompany['products'] = $value; break;
                        case '行业标签': $currentCompany['industryTags'] = $value; break;
                        case '创始人': $currentCompany['founders'] = $value; break;
                        case '简介': $currentCompany['description'] = $value; break;
                        case '融资阶段': $currentCompany['stage'] = $value; break;
                        case '状态': $currentCompany['status'] = $value; break;
                    }
                }
            }
        }

        if ($currentCompany) {
            $companies[] = $currentCompany;
        }
    }

    return $companies;
}
