<?php
/**
 * AI 解读 API 代理
 * 避免 CORS 问题，通过后端调用 Anthropic API
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 读取请求数据
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['system']) || !isset($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Anthropic API 配置
// 通过环境变量 ANTHROPIC_API_KEY 配置；勿把密钥写入仓库
$apiKey = getenv('ANTHROPIC_API_KEY') ?: '';

if (empty($apiKey)) {
    // 没有 API Key，返回内置默认解读
    // 根据输入内容生成一个稳定的哈希，确保相同输入返回相同结果
    $inputHash = md5($input['message'] . ($input['system'] ?? ''));
    $hashNum = hexdec(substr($inputHash, 0, 8));

    // 预设默认解读结果池
    $defaultResults = [
        [
            'headline' => '商业天赋与使命感',
            'summary' => '这位企业家的核心驱动力来自于改变世界的使命感。他们往往在年轻时就展现出超越同龄人的商业嗅觉，善于发现被忽视的市场机会。',
            'strengths' => '战略眼光 · 执行力 · 团队凝聚',
            'risks' => '过度理想化 · 忽视细节 · 工作生活失衡',
            'advice' => '建议建立更完善的决策机制，避免个人英雄主义。找到互补的合伙人是成功的关键。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '使命驱动型创业者'
        ],
        [
            'headline' => '创新颠覆者',
            'summary' => '典型的颠覆式创新者，不满足于渐进式改进，追求从根本上重构行业规则。这种特质让他们既能创造巨大价值，也面临巨大风险。',
            'strengths' => '第一性原理思维 · 抗压能力 · 快速迭代',
            'risks' => '与市场对抗 · 资金链风险 · 团队 burnout',
            'advice' => '在坚持愿景的同时，保持对市场的敬畏。建立足够的资金缓冲是活下去的前提。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '颠覆式创新者'
        ],
        [
            'headline' => '长期主义践行者',
            'summary' => '不追求短期爆发，更注重可持续增长。这种风格在资本狂热时可能显得保守，但在行业寒冬中往往能笑到最后。',
            'strengths' => '耐心 · 风险控制 · 组织韧性',
            'risks' => '错过窗口期 · 增长过慢 ·  investor 耐心',
            'advice' => '在坚持长期主义的同时，也要学会把握关键节点的加速机会。速度有时候就是壁垒。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '长期主义践行者'
        ],
        [
            'headline' => '产品极致主义者',
            'summary' => '对产品有着近乎偏执的追求，相信好的产品会自己说话。这种理念能打造出伟大的产品，但也可能导致错失市场时机。',
            'strengths' => '用户洞察 · 品质把控 · 品牌忠诚',
            'risks' => '完美主义陷阱 · 发布延迟 · 成本失控',
            'advice' => 'Done is better than perfect。学会在质量和速度之间找到平衡，快速验证比完美发布更重要。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '产品极致主义者'
        ],
        [
            'headline' => '资源整合高手',
            'summary' => '核心竞争力不在于技术创新，而在于资源整合能力。善于连接不同的人、资本和市场，构建互利共赢的生态。',
            'strengths' => '人脉网络 · 商业谈判 · 生态构建',
            'risks' => '核心壁垒不足 · 依赖外部资源 · 利益分配',
            'advice' => '在整合资源的同时，要建立自己的核心壁垒。单纯的平台模式很容易被替代。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '资源整合型领袖'
        ],
        [
            'headline' => '技术极客转型',
            'summary' => '从技术专家到商业领袖的转型之路。技术背景是巨大优势，但需要克服工程师思维，学会商业和人的管理。',
            'strengths' => '技术深度 · 产品理解 · 理性决策',
            'risks' => '过度技术导向 · 忽视市场 · 管理短板',
            'advice' => '找到懂商业的搭档，让自己专注在技术和产品上。学会用商业语言而非技术语言沟通。',
            'verdict' => '内置解读 · AI暂不可用',
            'posterLine' => '技术极客转型者'
        ]
    ];

    // 根据哈希选择一个结果
    $selectedIndex = $hashNum % count($defaultResults);
    $result = $defaultResults[$selectedIndex];
    $result['fromAI'] = false;

    http_response_code(200);
    echo json_encode($result);
    exit;
}

// 调用 Anthropic API
$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey,
    'anthropic-version: 2023-06-01'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'claude-sonnet-4-6',
    'max_tokens' => 1000,
    'system' => $input['system'],
    'messages' => [
        ['role' => 'user', 'content' => $input['message']]
    ]
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API request failed', 'code' => $httpCode]);
    exit;
}

// 解析响应
$data = json_decode($response, true);

if (!$data || !isset($data['content'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid API response']);
    exit;
}

// 提取文本
$text = '';
foreach ($data['content'] as $item) {
    if ($item['type'] === 'text') {
        $text .= $item['text'];
    }
}

$text = trim($text);
$text = preg_replace('/```json|```/', '', $text);
$text = trim($text);

// 尝试解析 JSON
$result = json_decode($text, true);

if ($result && isset($result['headline']) && isset($result['verdict'])) {
    $result['fromAI'] = true;
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response format']);
}
