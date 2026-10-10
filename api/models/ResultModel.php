<?php
/**
 * 结果计算模型（与前端 engine.js 算法一致，保证同对同分）
 */
class ResultModel
{
    /* ---------- 数据源（从 JSON 加载） ---------- */
    private static array $east = [];
    private static array $west = [];
    private static array $elE = [];
    private static array $elW = [];
    private static array $eord = ['木', '火', '土', '金', '水'];
    private static array $six = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
    private static array $w2e = ['火' => '火', '土' => '土', '风' => '木', '水' => '水'];
    private static array $e2wax = ['火' => '火象', '土' => '土象', '木' => '风象', '水' => '水象', '金' => '金属'];
    private static array $cross = [];
    private static array $blurb = [];

    /**
     * 从 JSON 加载数据
     */
    public static function loadData(): void
    {
        $east = FileModel::dataGet('east');
        $west = FileModel::dataGet('west');
        $elE  = FileModel::dataGet('elements_east');
        $elW  = FileModel::dataGet('elements_west');
        $cross = FileModel::dataGet('cross');
        $blurb = FileModel::dataGet('blurb');

        if ($east) self::$east = $east;
        if ($west) self::$west = $west;
        if ($elE)  self::$elE  = $elE;
        if ($elW)  self::$elW  = $elW;
        if ($cross) self::$cross = $cross;
        if ($blurb) self::$blurb = $blurb;
    }

    /**
     * 统一入口
     */
    public static function calc(string $sys, int $a, int $b, string $nameA = '', string $nameB = ''): array
    {
        self::loadData();
        $r = ($sys === 'east') ? self::eastResult($a, $b) : self::westResult($a, $b);

        // 名称默认
        if (!$nameA || !$nameB) {
            $data = $sys === 'east' ? self::$east : self::$west;
            if (!$nameA) $nameA = $sys === 'east' ? $data[$a]['animal'] : $data[$a]['name'];
            if (!$nameB) $nameB = $sys === 'east' ? $data[$b]['animal'] : $data[$b]['name'];
        }

        $cpText = "「{$nameA}」 × 「{$nameB}」";

        return [
            'system'  => $sys,
            'a'       => $a,
            'b'       => $b,
            'nameA'   => $nameA,
            'nameB'   => $nameB,
            'cpText'  => $cpText,
            'score'   => $r['score'],
            'tone'    => $r['tone'],
            'rel'     => $r['rel'],
            'elTag'   => $r['elTag'],
            'headline'=> $r['headline'],
            'tags'    => array_merge(explode('｜', $r['headline']), [$r['tone'] === 'gold' ? '金线·高适配' : ($r['tone'] === 'red' ? '红线·争议瓜' : '灰线·平淡型')]),
            'blurb'   => $r['blurb'],
            'cross'   => $r['cross'],
        ];
    }

    /* ---------- 东方评分 ---------- */
    private static function eastResult(int $a, int $b): array
    {
        $A = self::$east[$a];
        $B = self::$east[$b];
        $base = 0; $tone = 'gray'; $rel = '平相 · 普通缘分';

        $clash = ($b === ($a + 6) % 12);
        $six = false;
        foreach (self::$six as $p) {
            if (($p[0] === $a && $p[1] === $b) || ($p[0] === $b && $p[1] === $a)) { $six = true; break; }
        }
        $triads = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
        $three = false;
        foreach ($triads as $t) {
            if (in_array($a, $t) && in_array($b, $t) && $a !== $b) { $three = true; break; }
        }

        if ($a === $b)            { $base = 58; $tone = 'gray'; $rel = '比肩 · 撞型竞品'; }
        elseif ($clash)           { $base = 30; $tone = 'red';  $rel = '相冲 · 绯闻翻车'; }
        elseif ($six)             { $base = 90; $tone = 'gold'; $rel = '六合 · 官配荧幕CP'; }
        elseif ($three)           { $base = 84; $tone = 'gold'; $rel = '三合 · 圈内挚友二搭'; }

        $d = self::elDist($A['el'], $B['el']);
        if ($d === 1) {
            $base += 8;
            if ($tone === 'gray') $tone = 'gold';
            $elTag = $A['el'] . $B['el'] . '相生';
        } elseif ($d === 2) {
            $base -= 11;
            if ($tone !== 'gold') $tone = 'red';
            $elTag = $A['el'] . $B['el'] . '相克';
        } else {
            $elTag = '同' . $A['el'] . '比劫';
            if (strpos($rel, '比肩') === 0) $elTag = '同' . $A['el'] . '撞型';
        }

        $score = max(12, min(98, $base + self::spread($a, $b, -3, 3)));
        $ax = self::$e2wax[$A['el']] ?? '';
        $bx = self::$e2wax[$B['el']] ?? '';
        $crossA = self::$cross[$A['el']] ?? '';
        $crossB = self::$cross[$B['el']] ?? '';
        $cross = ($crossA === $crossB)
            ? "A「{$A['animal']}·{$A['el']}」≈{$ax}，B「{$B['animal']}·{$B['el']}」≈{$bx}。同属性叠buff：{$crossA}"
            : "A「{$A['animal']}·{$A['el']}」≈{$ax}，B「{$B['animal']}·{$B['el']}」≈{$bx}。{$crossA}；遇上{$crossB}。";

        return [
            'score'    => $score,
            'tone'     => $tone,
            'rel'      => $rel,
            'elTag'    => $elTag,
            'blurb'    => self::pickN($a, $b, self::$blurb[$tone] ?? ['']),
            'cross'    => $cross,
            'headline' => "{$rel}｜{$elTag}",
        ];
    }

    /* ---------- 西方评分 ---------- */
    private static function westResult(int $a, int $b): array
    {
        $A = self::$west[$a];
        $B = self::$west[$b];
        $base = 0; $tone = 'gray'; $rel = '弱相位 · 路人缘各半';

        $opp = ($b === ($a + 6) % 12);
        $square = ($b === ($a + 3) % 12 || $b === ($a + 9) % 12);
        $trine = ($A['el'] === $B['el'] && $a !== $b);
        $mod = ($b - $a + 12) % 12;
        $sextile = (in_array($mod, [2, 10]))
            && (($A['el'] === '火' && $B['el'] === '风')
                || ($A['el'] === '风' && $B['el'] === '火')
                || ($A['el'] === '土' && $B['el'] === '水')
                || ($A['el'] === '水' && $B['el'] === '土'));

        if ($a === $b)            { $base = 70; $tone = 'gold'; $rel = '同星座 · 同款人设'; }
        elseif ($opp)             { $base = 44; $tone = 'red';  $rel = '对冲 · 爱恨拉扯大瓜'; }
        elseif ($square)          { $base = 34; $tone = 'red';  $rel = '刑相位 · 舆论对立'; }
        elseif ($trine)           { $base = 90; $tone = 'gold'; $rel = '三分相 · 荧幕天选'; }
        elseif ($sextile)         { $base = 78; $tone = 'gold'; $rel = '六分相 · 营业默契'; }

        $score = max(12, min(98, $base + self::spread($a, $b, -3, 3)));
        $elTag = $A['el'] . '象×' . $B['el'] . '象' . ($A['el'] === $B['el'] ? ' 同象' : ' 异象');
        $ea = self::$w2e[$A['el']] ?? $A['el'];
        $eb = self::$w2e[$B['el']] ?? $B['el'];
        $crossA = self::$cross[$ea] ?? '';
        $crossB = self::$cross[$eb] ?? '';
        $cross = ($ea === $eb)
            ? "A「{$A['name']}·{$A['el']}象」≈五行{$ea}，B「{$B['name']}·{$B['el']}象」≈五行{$eb}。双解一致：{$crossA}"
            : "A「{$A['name']}·{$A['el']}象」≈五行{$ea}，B「{$B['name']}·{$B['el']}象」≈五行{$eb}。{$crossA}；碰上{$crossB}。";

        return [
            'score'    => $score,
            'tone'     => $tone,
            'rel'      => $rel,
            'elTag'    => $elTag,
            'blurb'    => self::pickN($a, $b, self::$blurb[$tone] ?? ['']),
            'cross'    => $cross,
            'headline' => "{$rel}｜{$elTag}",
        ];
    }

    /* ---------- 工具函数 ---------- */
    private static function elDist(string $x, string $y): int
    {
        $i = array_search($x, self::$eord);
        $j = array_search($y, self::$eord);
        if ($i === false || $j === false) return 0;
        $d = abs($i - $j);
        return min($d, 5 - $d);
    }

    private static function spread(int $a, int $b, int $lo, int $hi): int
    {
        $m = min($a, $b);
        $n = max($a, $b);
        return $lo + (($m * 7 + $n * 13 + $m * $n) % ($hi - $lo + 1));
    }

    private static function pickN(int $a, int $b, array $arr): string
    {
        if (empty($arr)) return '';
        $idx = (min($a, $b) + max($a, $b) * 3) % count($arr);
        return $arr[$idx] ?? '';
    }
}
