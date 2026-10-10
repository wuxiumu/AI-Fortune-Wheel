<?php
/**
 * AI 名人通用详情 API
 * 从 Markdown 文件读取详情数据并输出 JSON
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

// 将名称转换为文件名（小写、空格转连字符）
$fileName = strtolower(str_replace(' ', '-', $name)) . '.md';
$dataFile = __DIR__ . '/../data/details/' . $fileName;

if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => '详情文件不存在：' . $fileName], JSON_UNESCAPED_UNICODE);
    exit;
}

// 读取 Markdown 文件
$content = file_get_contents($dataFile);

// 解析 Markdown
$detail = parseDetail($content);

// 输出 JSON
echo json_encode([
    'success' => true,
    'data' => $detail
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

/**
 * 解析详情 Markdown（完整版）
 */
function parseDetail($text) {
    $detail = [
        'title' => '',
        'subtitle' => '',
        'name_en' => '',
        'avatar' => 'default.svg',
        'sections' => [],
        'companies' => [],
        'risks' => [],
        'ultimate_goal' => '',
        'quotes' => [],
        'timeline' => [],
        'core_quote' => null
    ];

    $lines = explode("\n", $text);
    $currentSection = null;
    $currentCompany = null;
    $inTimeline = false;
    $inCompanies = false;
    $inRisks = false;
    $inTable = false;

    foreach ($lines as $line) {
        $trimmed = trim($line);

        // 跳过空行
        if (empty($trimmed)) {
            continue;
        }

        // 跳过普通分隔线（表格内的分隔线要处理）
        if ($trimmed === '---' && !$inTable) {
            continue;
        }

        // 标题
        if (strpos($trimmed, '# ') === 0 && strpos($trimmed, '##') === false) {
            $detail['title'] = str_replace('# ', '', $trimmed);
            continue;
        }

        // 副标题
        if (strpos($trimmed, '>') === 0 && strpos($trimmed, '·') !== false) {
            $detail['subtitle'] = str_replace('> ', '', $trimmed);
            continue;
        }

        // 英文名
        if (preg_match('/^\*\*英文名\*\*:\s*(.+)$/', $trimmed, $matches)) {
            $detail['name_en'] = $matches[1];
            continue;
        }

        // 头像
        if (preg_match('/^\*\*头像\*\*:\s*(.+)$/', $trimmed, $matches)) {
            $detail['avatar'] = $matches[1];
            continue;
        }

        // 核心名言
        if (strpos($trimmed, '**"') === 0 && strpos($trimmed, '**') !== false) {
            $quote = preg_replace('/\*\*/', '', $trimmed);
            $detail['core_quote'] = ['text' => $quote, 'author' => ''];
            continue;
        }

        // 名言作者
        if ((strpos($trimmed, '—') === 0 || strpos($trimmed, '- ') === 0) && $detail['core_quote'] && empty($detail['core_quote']['author'])) {
            if (!preg_match('/\*\*.*\*\*:/', $trimmed)) {
                $detail['core_quote']['author'] = trim($trimmed, '— -');
                continue;
            }
        }

        // 二级标题（主要板块）
        if (strpos($trimmed, '## ') === 0) {
            // 保存之前的板块
            if ($currentSection) {
                $detail['sections'][] = $currentSection;
                $currentSection = null;
            }

            $sectionTitle = str_replace('## ', '', $trimmed);

            // 检查特殊板块
            if (strpos($sectionTitle, '时间线') !== false) {
                $inTimeline = true;
                $inCompanies = false;
                $inRisks = false;
            } elseif (strpos($sectionTitle, '主要公司') !== false) {
                $inCompanies = true;
                $inTimeline = false;
                $inRisks = false;
            } elseif (strpos($sectionTitle, '风险') !== false) {
                $inRisks = true;
                $inTimeline = false;
                $inCompanies = false;
            } elseif (strpos($sectionTitle, '终极目标') !== false) {
                $inTimeline = false;
                $inCompanies = false;
                $inRisks = false;
            } elseif (strpos($sectionTitle, '经典语录') !== false) {
                $inTimeline = false;
                $inCompanies = false;
                $inRisks = false;
            } elseif (strpos($sectionTitle, '核心名言') !== false) {
                $inTimeline = false;
                $inCompanies = false;
                $inRisks = false;
            } else {
                $inTimeline = false;
                $inCompanies = false;
                $inRisks = false;
                $currentSection = [
                    'title' => $sectionTitle,
                    'items' => []
                ];
            }
            continue;
        }

        // 三级标题（公司名称）
        if (strpos($trimmed, '### ') === 0 && $inCompanies) {
            if ($currentCompany) {
                $detail['companies'][] = $currentCompany;
            }
            $currentCompany = [
                'name' => str_replace('### ', '', $trimmed),
                'mission' => '',
                'goal' => ''
            ];
            continue;
        }

        // 公司使命和目标
        if ($inCompanies && $currentCompany) {
            if (preg_match('/^\*\*使命\*\*:\s*(.+)$/', $trimmed, $matches)) {
                $currentCompany['mission'] = $matches[1];
            } elseif (preg_match('/^\*\*目标\*\*:\s*(.+)$/', $trimmed, $matches)) {
                $currentCompany['goal'] = $matches[1];
            }
            continue;
        }

        // 时间线
        if ($inTimeline) {
            if (preg_match('/^-\s*\*+([\d未来]+)\*+\s*:\s*(.+)$/', $trimmed, $matches)) {
                $detail['timeline'][] = [
                    'year' => $matches[1],
                    'event' => $matches[2]
                ];
            } elseif (preg_match('/^-\s*([\d未来]+)\s*:\s*(.+)$/', $trimmed, $matches)) {
                $detail['timeline'][] = [
                    'year' => $matches[1],
                    'event' => $matches[2]
                ];
            }
            continue;
        }

        // 风险列表
        if ($inRisks) {
            if (preg_match('/^\d+\.\s*(.+)$/', $trimmed, $matches)) {
                $detail['risks'][] = $matches[1];
            }
            continue;
        }

        // 终极目标
        if (strpos($trimmed, '确保') === 0 || strpos($trimmed, '人类文明') !== false) {
            $detail['ultimate_goal'] = $trimmed;
            continue;
        }

        // 经典语录
        if (preg_match('/^\d+\.\s*["""](.+)["""]/', $trimmed, $matches)) {
            $detail['quotes'][] = $matches[1];
            continue;
        }
        if (preg_match('/^["""](.+)["""]/', $trimmed, $matches)) {
            $detail['quotes'][] = $matches[1];
            continue;
        }

        // 表格行解析（基本信息）
        if (strpos($trimmed, '|') !== false && $currentSection && $currentSection['title'] === '基本信息') {
            $inTable = true;
            $parts = array_filter(explode('|', $trimmed));
            $parts = array_values($parts);

            // 跳过表格头部分隔线
            if (preg_match('/^\|?[\s\-:]+\|[\s\-:]+\|?$/', $trimmed)) {
                continue;
            }

            // 跳过表格头
            if (count($parts) >= 2 && trim($parts[0]) === '项目') {
                continue;
            }

            // 解析表格数据行
            if (count($parts) >= 2) {
                $label = trim($parts[0]);
                $value = trim($parts[1]);
                if (!empty($label) && !empty($value)) {
                    $currentSection['items'][] = [
                        'title' => '',
                        'content' => "**$label**: $value"
                    ];
                }
            }
            continue;
        }

        // 非表格行时重置表格状态
        if ($inTable && strpos($trimmed, '|') === false) {
            $inTable = false;
        }

        // 普通列表项（板块内容）
        if ($currentSection && preg_match('/^\d+\.\s*\*\*(.+?)\*\*/', $trimmed, $matches)) {
            $itemTitle = $matches[1];
            $itemContent = preg_replace('/^\d+\.\s*\*\*.+?\*\*\s*/', '', $trimmed);

            $currentSection['items'][] = [
                'title' => $itemTitle,
                'content' => $itemContent
            ];
            continue;
        }

        // 更新最后一个 item 的内容
        if ($currentSection && !empty($currentSection['items']) &&
            !preg_match('/^\d+\./', $trimmed) && !empty($trimmed) && !$inTable) {
            $lastItem = &$currentSection['items'][count($currentSection['items']) - 1];
            if (strpos($lastItem['content'], $trimmed) === false) {
                $lastItem['content'] .= ' ' . $trimmed;
            }
            unset($lastItem);
        }
    }

    // 保存最后一个板块
    if ($currentSection) {
        $detail['sections'][] = $currentSection;
    }

    // 保存最后一个公司
    if ($currentCompany) {
        $detail['companies'][] = $currentCompany;
    }

    return $detail;
}
