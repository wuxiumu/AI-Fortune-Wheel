/* ============================================================
   engine.js — 评分引擎
   所有命理算法（东方地支关系、西方相位、分数计算、评语生成）
   纯函数，无 DOM 操作，便于单元测试
   ============================================================ */

/** 五行距离（相生=1，相克=2，其他=0） */
function elDist(x, y) {
  const i = EORD.indexOf(x);
  const j = EORD.indexOf(y);
  const d = Math.abs(i - j);
  return Math.min(d, 5 - d);
}

/** 确定性伪随机：同一对始终同一分数区间 */
function spread(a, b, lo, hi) {
  const m = Math.min(a, b);
  const n = Math.max(a, b);
  return lo + ((m * 7 + n * 13 + m * n) % (hi - lo + 1));
}

/** 从数组中稳定取一项（不洗牌） */
function pickN(a, b, arr) {
  return arr[(Math.min(a, b) + Math.max(a, b) * 3) % arr.length];
}

/** 东方 · 地支 + 五行综合评分 */
function eastResult(a, b) {
  const A = EAST[a], B = EAST[b];
  let base, tone, rel;

  const clash = b === (a + 6) % 12;
  const six = SIX.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
  const triads = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
  const three = triads.some(t => t.includes(a) && t.includes(b) && a !== b);

  if (a === b)            { base = 58; tone = 'gray'; rel = '比肩 · 撞型竞品'; }
  else if (clash)         { base = 30; tone = 'red';  rel = '相冲 · 绯闻翻车'; }
  else if (six)           { base = 90; tone = 'gold'; rel = '六合 · 官配荧幕CP'; }
  else if (three)         { base = 84; tone = 'gold'; rel = '三合 · 圈内挚友二搭'; }
  else                    { base = 60; tone = 'gray'; rel = '平相 · 普通缘分'; }

  const d = elDist(A.el, B.el);
  let elTag;
  if (d === 1) {
    base += 8;
    if (tone === 'gray') tone = 'gold';
    elTag = A.el + B.el + '相生';
  } else if (d === 2) {
    base -= 11;
    if (tone !== 'gold') tone = 'red';
    elTag = A.el + B.el + '相克';
  } else {
    elTag = '同' + A.el + '比劫';
    if (rel.startsWith('比肩')) elTag = '同' + A.el + '撞型';
  }

  const score = Math.max(12, Math.min(98, base + spread(a, b, -3, 3)));
  const ax = E2WAX[A.el], bx = E2WAX[B.el];
  const cross = `A「${A.animal}·${A.el}」≈${ax}，B「${B.animal}·${B.el}」≈${bx}。`
    + (CROSS[A.el] === CROSS[B.el]
        ? '同属性叠buff：' + CROSS[A.el]
        : CROSS[A.el] + '；遇上' + CROSS[B.el] + '。');

  return {
    score, tone, rel, elTag,
    blurb: pickN(a, b, BLURB[tone]),
    cross,
    headline: `${rel}｜${elTag}`
  };
}

/** 西方 · 星座相位 + 四象综合评分 */
function westResult(a, b) {
  const A = WEST[a], B = WEST[b];
  let base, tone, rel;

  const opp = b === (a + 6) % 12;
  const square = (b === (a + 3) % 12 || b === (a + 9) % 12);
  const trine = (A.el === B.el && a !== b);
  const sextile = ([2, 10].includes((b - a + 12) % 12))
    && ((A.el === '火' && B.el === '风')
      || (A.el === '风' && B.el === '火')
      || (A.el === '土' && B.el === '水')
      || (A.el === '水' && B.el === '土'));

  if (a === b)            { base = 70; tone = 'gold'; rel = '同星座 · 同款人设'; }
  else if (opp)           { base = 44; tone = 'red';  rel = '对冲 · 爱恨拉扯大瓜'; }
  else if (square)        { base = 34; tone = 'red';  rel = '刑相位 · 舆论对立'; }
  else if (trine)         { base = 90; tone = 'gold'; rel = '三分相 · 荧幕天选'; }
  else if (sextile)       { base = 78; tone = 'gold'; rel = '六分相 · 营业默契'; }
  else                    { base = 56; tone = 'gray'; rel = '弱相位 · 路人缘各半'; }

  const score = Math.max(12, Math.min(98, base + spread(a, b, -3, 3)));
  const elTag = A.el + '象×' + B.el + '象' + (A.el === B.el ? ' 同象' : ' 异象');
  const ea = W2E[A.el], eb = W2E[B.el];
  const cross = `A「${A.name}·${A.el}象」≈五行${ea}，B「${B.name}·${B.el}象」≈五行${eb}。`
    + (ea === eb
        ? '双解一致：' + CROSS[ea]
        : CROSS[ea] + '；碰上' + CROSS[eb] + '。');

  return {
    score, tone, rel, elTag,
    blurb: pickN(a, b, BLURB[tone]),
    cross,
    headline: `${rel}｜${elTag}`
  };
}

/** 统一入口：根据当前 system 调用对应引擎 */
function calcResult(system, a, b) {
  return (system === 'east' ? eastResult : westResult)(a, b);
}
