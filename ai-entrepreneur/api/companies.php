<?php
/**
 * AI 企业 API
 * 优先读 JSON 缓存，避免每次解析 Markdown
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=300');

$dataFile = __DIR__ . '/../data/ai_companies_zh.md';
$cacheFile = __DIR__ . '/../data/companies.json';

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
$companies = parseCompanies($content);
$output = json_encode([
    'success' => true,
    'count' => count($companies),
    'data' => $companies
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

file_put_contents($cacheFile, $output, LOCK_EX);
echo $output;

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
