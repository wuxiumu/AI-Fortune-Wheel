/* ============================================================
   wheel.js — 轮盘 SVG 绘制 + 动效
   ============================================================ */

const NS = 'http://www.w3.org/2000/svg';
const CX = 300, CY = 300;

/** 极坐标 → 直角坐标 */
function pol(r, a) {
  return [
    CX + r * Math.sin(a * Math.PI / 180),
    CY - r * Math.cos(a * Math.PI / 180)
  ];
}

/** 生成扇形 path */
function sector(r1, r2, a0, a1) {
  const [x1, y1] = pol(r2, a0);
  const [x2, y2] = pol(r2, a1);
  const [x3, y3] = pol(r1, a1);
  const [x4, y4] = pol(r1, a0);
  const laf = (a1 - a0) > 180 ? 1 : 0;
  return `M${x1} ${y1}A${r2} ${r2} 0 ${laf} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${laf} 0 ${x4} ${y4}Z`;
}

/** 快捷创建 SVG 元素 */
function mk(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

/** 构建整张轮盘 */
function buildWheel() {
  const svg = document.getElementById('wheel');
  if (!svg) return;
  svg.innerHTML = '';

  const data = pickSys();
  const isE = currentSys === 'east';

  /* defs（渐变 + 滤镜） */
  const defs = mk('defs', {});
  defs.innerHTML = `
    <radialGradient id="core" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="${isE ? '#fff' : '#cdb6ff'}"/>
      <stop offset="55%" stop-color="${isE ? '#e9e3ff' : '#7b5bd6'}"/>
      <stop offset="100%" stop-color="${isE ? '#b9aee6' : '#2a1a52'}"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${isE ? '#ffd56b' : '#b57bff'}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${isE ? '#ffd56b' : '#b57bff'}" stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  /* 呼吸光晕（背景） */
  const halo = mk('circle', {
    cx: CX, cy: CY, r: 280,
    fill: 'url(#halo)',
    opacity: 0.6,
    style: 'animation: breathe 4s ease-in-out infinite'
  });
  svg.appendChild(halo);

  /* 外装饰圈 */
  svg.appendChild(mk('circle', { cx: CX, cy: CY, r: 296, fill: 'none', stroke: 'rgba(255,255,255,.10)', 'stroke-width': 1 }));
  svg.appendChild(mk('circle', { cx: CX, cy: CY, r: 262, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 1 }));

  /* 外圈环绕文字 */
  const pid = 'tp';
  const tp = mk('path', {
    id: pid,
    d: `M${CX} ${CY} m -278 0 a 278 278 0 1 1 556 0 a 278 278 0 1 1 -556 0`,
    fill: 'none'
  });
  defs.appendChild(tp);
  const tt = mk('text', {
    fill: 'rgba(255,255,255,.34)',
    'font-size': 12.5,
    'letter-spacing': '6',
    'font-family': 'var(--mono)'
  });
  const tpath = mk('textPath', { href: '#' + pid });
  tpath.setAttribute('startOffset', '0');
  tpath.textContent = '  明星CP配对   ·   绯闻缘分速测   ·   五行星座双解   ·   仅供娱乐吃瓜   · ';
  tt.appendChild(tpath);
  svg.appendChild(tt);

  /* 元素环 */
  const els = isE ? EORD : ['火', '土', '风', '水'];
  const seg = 360 / els.length;
  els.forEach((el, i) => {
    const a0 = i * seg - seg / 2;
    const a1 = a0 + seg;
    const info = isE ? EL_E[el] : EL_W[el];
    svg.appendChild(mk('path', {
      d: sector(234, 286, a0, a1),
      fill: info.c, 'fill-opacity': .82,
      stroke: 'rgba(12,10,29,.5)', 'stroke-width': 1.5
    }));
    const [lx, ly] = pol(266, i * seg);
    const g = mk('text', { x: lx, y: ly + 2, 'text-anchor': 'middle', class: 'ring-el-label', fill: '#1a0e24' });
    g.textContent = el;
    svg.appendChild(g);
    const [kx, ky] = pol(248, i * seg);
    const k = mk('text', { x: kx, y: ky + 3, 'text-anchor': 'middle', class: 'ring-el-kw' });
    k.textContent = info.kw;
    svg.appendChild(k);
  });

  /* 东方五行相克五角星 */
  if (isE) {
    const pts = EORD.map((_, i) => pol(232, i * 72));
    const star = [0, 2, 4, 1, 3, 0];
    let dd = '';
    star.forEach((idx, k) => { const [x, y] = pts[idx]; dd += (k ? 'L' : 'M') + x + ' ' + y + ' '; });
    svg.appendChild(mk('path', {
      d: dd, fill: 'none',
      stroke: 'var(--red)', 'stroke-width': 1.1, 'stroke-opacity': .5,
      'stroke-dasharray': '4 4'
    }));
  }

  /* 主盘 12 等分 */
  for (let i = 0; i < 12; i++) {
    const a0 = i * 30 - 15, a1 = a0 + 30;
    const segEl = mk('path', {
      class: 'seg', id: 'seg' + i,
      d: sector(138, 228, a0, a1),
      fill: isE ? 'rgba(30,24,58,.72)' : 'rgba(40,28,78,.7)',
      stroke: 'rgba(255,255,255,.10)', 'stroke-width': 1,
      style: 'cursor:pointer;transition:fill .2s',
      'data-idx': i
    });
    segEl.addEventListener('click', () => onSegClick(i));
    segEl.addEventListener('mouseenter', () => {
      if (!segEl.classList.contains('on-a') && !segEl.classList.contains('on-b')) {
        segEl.setAttribute('fill', isE ? 'rgba(50,40,90,.9)' : 'rgba(60,45,110,.9)');
      }
    });
    segEl.addEventListener('mouseleave', () => {
      if (!segEl.classList.contains('on-a') && !segEl.classList.contains('on-b')) {
        segEl.setAttribute('fill', isE ? 'rgba(30,24,58,.72)' : 'rgba(40,28,78,.7)');
      }
    });
    svg.appendChild(segEl);

    const d = data[i];
    const [gx, gy] = pol(196, i * 30);
    const [nx, ny] = pol(170, i * 30);
    const [ex, ey] = pol(152, i * 30);
    const gl = mk('text', { x: gx, y: gy + 8, 'text-anchor': 'middle', class: 'seg-glyph' });
    gl.textContent = isE ? d.gl : d.sym;
    if (!isE) gl.setAttribute('fill', (EL_W[d.el] || {}).c || '#fff');
    svg.appendChild(gl);
    const nm = mk('text', { x: nx, y: ny + 4, 'text-anchor': 'middle', class: 'seg-name' });
    nm.textContent = isE ? (d.br + d.animal) : d.name;
    svg.appendChild(nm);
    const elText = mk('text', { x: ex, y: ey + 3, 'text-anchor': 'middle', class: 'seg-el', fill: (isE ? EL_E[d.el] : EL_W[d.el]).c });
    elText.textContent = isE ? d.el : d.el + '象';
    svg.appendChild(elText);
  }

  /* 内层小字环 */
  svg.appendChild(mk('circle', { cx: CX, cy: CY, r: 135, fill: 'rgba(10,8,24,.55)' }));
  const inner = isE ? ['比肩', '劫财', '食神', '伤官', '正财', '偏财'] : ['太阳', '月亮', '金星', '火星'];
  inner.forEach((t, i) => {
    const ang = i * (360 / inner.length);
    const [x, y] = pol(120, ang);
    const e = mk('text', {
      x, y: y + 3, 'text-anchor': 'middle', class: 'inner-lab',
      transform: `rotate(${ang > 90 && ang < 270 ? ang + 180 : ang} ${x} ${y})`
    });
    e.textContent = t;
    svg.appendChild(e);
  });

  /* 圆心 */
  svg.appendChild(mk('circle', { cx: CX, cy: CY, r: 92, fill: 'url(#core)', stroke: 'rgba(255,255,255,.25)', 'stroke-width': 1.5 }));
  if (isE) {
    svg.appendChild(mk('path', {
      d: `M${CX} ${CY - 78}A78 78 0 0 1 ${CX} ${CY + 78}A39 39 0 0 1 ${CX} ${CY}A39 39 0 0 0 ${CX} ${CY - 78}Z`,
      fill: '#1a1330'
    }));
    svg.appendChild(mk('circle', { cx: CX, cy: CY - 39, r: 11, fill: '#1a1330' }));
    svg.appendChild(mk('circle', { cx: CX, cy: CY + 39, r: 11, fill: '#f3effc' }));
  } else {
    for (let i = 0; i < 3; i++) {
      svg.appendChild(mk('ellipse', {
        cx: CX, cy: CY, rx: 70 - i * 6, ry: 26 - i * 4,
        fill: 'none', stroke: 'rgba(255,255,255,.3)', 'stroke-width': 1,
        transform: `rotate(${i * 60} ${CX} ${CY})`
      }));
    }
    svg.appendChild(mk('circle', { cx: CX, cy: CY, r: 8, fill: '#fff' }));
  }

  /* 关系连线层 + 指针 */
  svg.appendChild(mk('path', { id: 'relLine', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }));
  ['a', 'b'].forEach(side => {
    const col = side === 'a' ? 'var(--a)' : 'var(--b)';
    const g = mk('g', {
      id: 'ptr' + side, opacity: 0,
      style: 'transition:.9s cubic-bezier(.18,.9,.2,1);transform-origin:300px 300px'
    });
    g.appendChild(mk('path', { d: `M${CX} ${CY - 118}L${CX - 7} ${CY - 92}L${CX + 7} ${CY - 92}Z`, fill: col }));
    g.appendChild(mk('line', { x1: CX, y1: CY, x2: CX, y2: CY - 100, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    g.appendChild(mk('circle', { cx: CX, cy: CY - 118, r: 4, fill: col }));
    svg.appendChild(g);
  });

  /* 科技粒子层 */
  addParticles(svg, isE);

  applySelection();
}

/** 添加漂浮粒子（科技感） */
function addParticles(svg, isE) {
  const particleGroup = mk('g', { class: 'particles', opacity: 0.6 });
  const color = isE ? '#ffd56b' : '#b57bff';
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * 360;
    const radius = 150 + Math.random() * 120;
    const [x, y] = pol(radius, angle);
    const size = 1 + Math.random() * 2;
    const p = mk('circle', {
      cx: x, cy: y, r: size,
      fill: color,
      opacity: 0.3 + Math.random() * 0.5,
      style: `animation: float${i % 3} ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`
    });
    particleGroup.appendChild(p);
  }
  svg.appendChild(particleGroup);
}

/** 根据选中态更新指针 / 高亮扇形 / 关系连线 */
function applySelection() {
  for (let i = 0; i < 12; i++) {
    const s = document.getElementById('seg' + i);
    if (s) s.classList.remove('on-a', 'on-b');
  }
  ['a', 'b'].forEach(side => {
    const ptr = document.getElementById('ptr' + side);
    if (!ptr) return;
    if (selection[side] === null) {
      ptr.setAttribute('opacity', 0);
      return;
    }
    ptr.setAttribute('opacity', 1);
    ptr.style.transform = `rotate(${selection[side] * 30}deg)`;
    const s = document.getElementById('seg' + selection[side]);
    if (s) s.classList.add('on-' + side);
  });
  // 关系连线
  const line = document.getElementById('relLine');
  if (selection.a !== null && selection.b !== null && selection.a !== selection.b) {
    const r = calcResult(currentSys, selection.a, selection.b);
    const [ax, ay] = pol(132, selection.a * 30);
    const [bx, by] = pol(132, selection.b * 30);
    line.setAttribute('d', `M${ax} ${ay}Q${CX} ${CY} ${bx} ${by}`);
    line.setAttribute('stroke', r.tone === 'gold' ? 'var(--gold)' : r.tone === 'red' ? 'var(--red)' : 'var(--gray)');
    line.setAttribute('stroke-dasharray', r.tone === 'gray' ? '6 6' : 'none');
    line.setAttribute('opacity', .9);
  } else {
    line.setAttribute('opacity', 0);
  }
}
