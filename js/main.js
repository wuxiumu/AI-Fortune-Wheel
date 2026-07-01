/* ============================================================
   main.js — 应用入口：状态、UI 交互、事件绑定
   ============================================================ */

/* ---------- 状态：当前结果快照（供分享用） ---------- */
let lastResult = null;
let lastResultWest = null; // 用于对比模式（保存另一系统的结果）

/* ---------- 全局状态 ---------- */
let currentSys = 'east';
const selection = { a: null, b: null };
let pickMode = 'a'; // 盘面点击时选哪一侧：'a' 或 'b'

/** 根据当前 system 返回数据源 */
function pickSys() {
  return currentSys === 'east' ? EAST : WEST;
}

/* ---------- Chips 构建 ---------- */
function buildChips() {
  ['a', 'b'].forEach(side => {
    const box = document.getElementById('chips' + side.toUpperCase());
    box.innerHTML = '';
    pickSys().forEach((d, i) => {
      const c = document.createElement('div');
      c.className = 'chip';
      c.dataset.i = i;
      c.innerHTML = `<span class="gl">${currentSys === 'east' ? d.gl : d.sym}</span>`
        + `<span class="nm">${currentSys === 'east' ? d.animal : d.name}</span>`
        + `<span class="el">${d.el}${currentSys === 'east' ? '' : '象'}</span>`;
      c.addEventListener('click', () => {
        selection[side] = i;
        pickMode = side === 'a' ? 'b' : 'a'; // 下次盘面点击选另一侧
        buildChips();
        applySelection();
        maybeAuto();
      });
      if (selection[side] === i) c.classList.add('on');
      box.appendChild(c);
    });
  });
  document.getElementById('spin').disabled = !(selection.a !== null && selection.b !== null);
}

/* ---------- 盘面点击选择（轮盘交互） ---------- */
function onSegClick(idx) {
  selection[pickMode] = idx;
  pickMode = pickMode === 'a' ? 'b' : 'a'; // 切换下一次
  buildChips();
  applySelection();
  maybeAuto();
}

/* ---------- 自动触发 ---------- */
let autoTimer;
function maybeAuto() {
  if (selection.a !== null && selection.b !== null) {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(runResult, 650);
  }
}

/* ---------- 结果渲染 ---------- */
function runResult() {
  if (selection.a === null || selection.b === null) return;

  // 转盘动画
  spinWheel();

  // 延迟出结果（配合动画）
  setTimeout(() => showResult(), 900);
}

function showResult() {
  const r = calcResult(currentSys, selection.a, selection.b);
  const data = pickSys();
  const nameA = document.getElementById('nameA').value.trim()
    || (currentSys === 'east' ? data[selection.a].animal : data[selection.a].name);
  const nameB = document.getElementById('nameB').value.trim()
    || (currentSys === 'east' ? data[selection.b].animal : data[selection.b].name);

  // 保存结果快照供分享
  lastResult = {
    system: currentSys,
    cpText: `「${nameA}」 × 「${nameB}」`,
    nameA, nameB,
    score: r.score,
    tone: r.tone,
    tags: [...r.headline.split('｜'),
           r.tone === 'gold' ? '金线·高适配' : r.tone === 'red' ? '红线·争议瓜' : '灰线·平淡型'],
    blurb: r.blurb,
    cross: r.cross,
    headline: r.headline,
    // 保存选择信息以便恢复
    selectionA: selection.a,
    selectionB: selection.b
  };

  // 保存到历史记录
  History.save(lastResult);
  renderHistory();

  // 对比模式：保存另一系统的结果
  if (currentSys === 'east') {
    const rW = calcResult('west', selection.a, selection.b);
    lastResultWest = { ...rW, system: 'west', nameA, nameB,
      cpText: lastResult.cpText };
  } else {
    const rE = calcResult('east', selection.a, selection.b);
    lastResultWest = { ...rE, system: 'east', nameA, nameB,
      cpText: lastResult.cpText };
  }
  renderCompare();

  document.getElementById('rCp').textContent = lastResult.cpText;

  const tones = { gold: 'gold', red: 'red', gray: 'gray' };
  document.getElementById('rTags').innerHTML =
    r.headline.split('｜').map(t => `<span class="tag ${tones[r.tone]}">${t}</span>`).join('')
    + `<span class="tag ${tones[r.tone]}">${r.tone === 'gold' ? '金线·高适配' : r.tone === 'red' ? '红线·争议瓜' : '灰线·平淡型'}</span>`;

  document.getElementById('rBlurb').textContent = `【${r.headline}】适配度 ${r.score}%，${r.blurb}`;
  document.getElementById('rCross').textContent = r.cross;

  // 更新收藏按钮状态
  updateFavoriteButton();

  // 分数环动画
  const arc = document.getElementById('scoreArc');
  const circ = 314;
  document.getElementById('scoreNum').textContent = '0';
  arc.style.transition = 'none';
  arc.setAttribute('stroke-dashoffset', circ);

  const res = document.getElementById('result');
  res.classList.add('show');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      arc.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)';
      arc.setAttribute('stroke-dashoffset', circ * (1 - r.score / 100));
      let n = 0;
      const tgt = r.score;
      const step = Math.max(1, Math.round(tgt / 28));
      const iv = setInterval(() => {
        n += step;
        if (n >= tgt) { n = tgt; clearInterval(iv); }
        document.getElementById('scoreNum').textContent = n;
      }, 32);
    });
  });
  res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 直接显示历史记录的结果（不触发动画）
 */
function showResultDirect(record) {
  // 更新结果卡片内容
  document.getElementById('rCp').textContent = record.cpText;

  const tones = { gold: 'gold', red: 'red', gray: 'gray' };
  document.getElementById('rTags').innerHTML =
    record.tags.map(t => `<span class="tag ${tones[record.tone]}">${t}</span>`).join('');

  document.getElementById('rBlurb').textContent = `【${record.headline}】适配度 ${record.score}%，${record.blurb}`;
  document.getElementById('rCross').textContent = record.cross;

  // 分数环直接显示最终状态（不触发动画）
  const arc = document.getElementById('scoreArc');
  const circ = 314;
  document.getElementById('scoreNum').textContent = record.score;
  arc.style.transition = 'none';
  arc.setAttribute('stroke-dashoffset', circ * (1 - record.score / 100));

  // 显示结果卡片
  const res = document.getElementById('result');
  res.classList.add('show');

  // 更新收藏按钮状态
  updateFavoriteButton();
}

/* ---------- 转盘旋转动画 ---------- */
function spinWheel() {
  const wheel = document.getElementById('wheel');
  if (!wheel) return;
  // 重置旋转（保留现有 transform，仅叠加旋转动画）
  const currentTransform = wheel.style.transform || 'rotate(0deg)';
  const match = currentTransform.match(/rotate\(([^)]+)\)/);
  const curAngle = match ? parseFloat(match[1]) : 0;
  const turns = 3 + Math.floor(Math.random() * 3); // 3-5 圈
  const targetAngle = curAngle + turns * 360;

  wheel.style.transition = 'transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)';
  wheel.style.transform = `rotate(${targetAngle}deg)`;
}

/* ---------- 历史记录渲染 ---------- */
let currentSort = 'desc'; // 'desc' = 最新在前, 'asc' = 最早在前
let currentPanel = 'all'; // 'all' = 所有记录, 'favorites' = 收藏

function renderHistory() {
  const content = document.getElementById('historyContent');
  if (!content) return;

  let history = currentPanel === 'all' ? History.getAll() : History.getFavorites();

  if (history.length === 0) {
    const emptyText = currentPanel === 'all'
      ? '还没有测试记录'
      : '还没有收藏的记录';
    const emptyHint = currentPanel === 'all'
      ? '转动轮盘开始你的第一次吃瓜吧！'
      : '点击结果卡上的收藏按钮添加收藏';

    content.innerHTML = `
      <div class="history-empty">
        <div class="empty-icon">📜</div>
        <p>${emptyText}</p>
        <p class="hint">${emptyHint}</p>
      </div>
    `;
    return;
  }

  // 排序
  history = [...history].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return currentSort === 'desc' ? timeB - timeA : timeA - timeB;
  });

  content.innerHTML = history.slice(0, 12).map(record => {
    const time = new Date(record.timestamp);
    const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    const systemLabel = record.system === 'east' ? '☯ 东方' : '✦ 西方';

    return `
      <div class="history-card" data-id="${record.id}">
        <div class="card-header">
          <span class="card-system">${systemLabel}</span>
          <span class="card-time">${timeStr}</span>
        </div>
        <div class="card-cp">${record.cpText}</div>
        <div class="card-score ${record.tone}">${record.score}%</div>
        <div class="card-headline">${record.headline}</div>
        <div class="card-actions">
          <button class="card-btn btn-view" data-id="${record.id}">👁 查看</button>
          <button class="card-btn btn-delete" data-id="${record.id}">🗑 删除</button>
        </div>
      </div>
    `;
  }).join('');

  // 绑定事件
  content.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      // 根据当前面板查找记录
      let record;
      if (currentPanel === 'all') {
        record = History.getAll().find(r => r.id === id);
      } else {
        record = History.getFavorites().find(r => r.id === id);
      }

      // 使用自定义模态框
      const confirmed = await Modal.confirm({
        title: '删除记录',
        message: `确定要删除「${record?.cpText || '这条记录'}」吗？删除后无法恢复。`,
        confirmText: '删除',
        cancelText: '取消',
        type: 'danger'
      });

      if (confirmed) {
        if (currentPanel === 'favorites') {
          // 从收藏中删除（取消收藏）
          History.toggleFavorite(record);
        } else {
          // 从历史记录中删除
          History.remove(id);
        }
        renderHistory();
        showToast('已删除', 'success');
      }
    });
  });

  content.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      // 根据当前面板查找记录
      let record;
      if (currentPanel === 'all') {
        record = History.getAll().find(r => r.id === id);
      } else {
        record = History.getFavorites().find(r => r.id === id);
      }

      if (record) {
        showHistoryViewModal(record);
      }
    });
  });

  // 卡片整体点击也可以查看
  content.querySelectorAll('.history-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // 如果点击的是按钮，不触发卡片点击
      if (e.target.closest('.card-btn')) return;
      const viewBtn = card.querySelector('.btn-view');
      if (viewBtn) viewBtn.click();
    });
  });
}

/* ---------- 收藏功能 ---------- */
function updateFavoriteButton() {
  const btn = document.getElementById('btnFavorite');
  if (!btn || !lastResult) return;

  const isFav = History.isFavorite(lastResult);
  btn.classList.toggle('favorited', isFav);
  btn.querySelector('.icon').textContent = isFav ? '★' : '☆';
  btn.querySelector('.text').textContent = isFav ? '已收藏' : '收藏';
}

/* ---------- History View Modal ---------- */
let currentViewRecord = null;

function showHistoryViewModal(record) {
  currentViewRecord = record;
  const modal = document.getElementById('historyViewModal');
  if (!modal) return;

  // 填充数据
  const time = new Date(record.timestamp);
  const timeStr = `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
  document.getElementById('historyViewTime').textContent = `测试时间：${timeStr}`;

  const systemBadge = document.getElementById('viewSystemBadge');
  systemBadge.textContent = record.system === 'east' ? '☯ 东方五行' : '✦ 西方星座';
  systemBadge.className = `view-system-badge ${record.system}`;

  document.getElementById('viewCpText').textContent = record.cpText || '未知配对';
  document.getElementById('viewScoreNumber').textContent = `${record.score || 0}%`;

  // 标签（防御性检查）
  const tags = record.tags || [];
  const tone = record.tone || 'gray';
  const tagsHtml = tags.length > 0
    ? tags.map(t => `<span class="tag ${tone}">${t}</span>`).join('')
    : '<span class="tag gray">暂无标签</span>';
  document.getElementById('viewTags').innerHTML = tagsHtml;

  document.getElementById('viewHeadline').textContent = record.headline || '暂无关系判定';
  document.getElementById('viewBlurb').textContent = record.blurb || '暂无详细解读';
  document.getElementById('viewCross').textContent = record.cross || '暂无互译信息';

  // 显示弹窗
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeHistoryViewModal() {
  const modal = document.getElementById('historyViewModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  currentViewRecord = null;
}

function bindHistoryViewModal() {
  const modal = document.getElementById('historyViewModal');
  const closeBtn = document.getElementById('historyViewModalClose');
  const closeBtn2 = document.getElementById('viewCloseBtn');
  const retestBtn = document.getElementById('viewRetestBtn');
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!modal) return;

  // 关闭按钮
  if (closeBtn) {
    closeBtn.addEventListener('click', closeHistoryViewModal);
  }
  if (closeBtn2) {
    closeBtn2.addEventListener('click', closeHistoryViewModal);
  }

  // 点击遮罩层关闭
  if (overlay) {
    overlay.addEventListener('click', closeHistoryViewModal);
  }

  // 按 ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeHistoryViewModal();
    }
  });

  // 重新测试按钮
  if (retestBtn) {
    retestBtn.addEventListener('click', () => {
      if (!currentViewRecord) return;

      const record = currentViewRecord;

      // 关闭弹窗
      closeHistoryViewModal();

      // 1. 先滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 2. 显示打印文字动画
      setTimeout(() => {
        showRetestAnimation(record);
      }, 500);
    });
  }
}

/* ---------- 重新测试动画 ---------- */
function showRetestAnimation(record) {
  // 创建动画提示元素
  const toast = document.getElementById('toast');
  if (!toast) return;

  // 切换到对应系统
  if (currentSys !== record.system) {
    setSys(record.system);
  }

  // 恢复选择
  if (record.selectionA !== undefined && record.selectionB !== undefined) {
    selection.a = record.selectionA;
    selection.b = record.selectionB;

    // 更新名字输入框
    const nameAInput = document.getElementById('nameA');
    const nameBInput = document.getElementById('nameB');
    if (nameAInput) nameAInput.value = record.nameA || '';
    if (nameBInput) nameBInput.value = record.nameB || '';

    // 更新 UI
    buildChips();
    applySelection();
  }

  // 3. 显示计算中提示（带打字机效果）
  const messages = ['🔮 正在解读命理...', '✨ 计算缘分指数...', '🎯 即将揭晓结果...'];
  let msgIndex = 0;

  function showNextMessage() {
    if (msgIndex < messages.length) {
      showToast(messages[msgIndex], '');
      msgIndex++;
      setTimeout(showNextMessage, 600);
    } else {
      // 4. 开始计算（带旋转动画）
      runResult();

      // 5. 计算完成后延迟1秒跳转到结果区域
      setTimeout(() => {
        const resultEl = document.getElementById('result');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // 高亮结果卡片
          resultEl.style.animation = 'resultHighlight 1s ease-out';
          setTimeout(() => {
            resultEl.style.animation = '';
          }, 1000);
        }
      }, 1900); // 轮盘动画 900ms + 延迟 1000ms
    }
  }

  showNextMessage();
}

function bindFavorite() {
  const btn = document.getElementById('btnFavorite');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止事件冒泡
    if (!lastResult) {
      showToast('请先计算一对 CP', 'error');
      return;
    }
    const result = History.toggleFavorite(lastResult);
    updateFavoriteButton();
    if (result.action === 'added') {
      showToast('已添加到收藏', 'success');
    } else if (result.action === 'removed') {
      showToast('已取消收藏', '');
    } else if (result.action === 'error') {
      showToast('操作失败', 'error');
    }
  });
}

function bindHistoryTabs() {
  const tabs = document.querySelectorAll('.history-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPanel = tab.dataset.panel;
      renderHistory();
    });
  });

  // 排序按钮
  const sortBtns = document.querySelectorAll('.sort-btn');
  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderHistory();
    });
  });

  // 清空按钮
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      const count = currentPanel === 'all' ? History.getAll().length : History.getFavorites().length;
      if (count === 0) {
        showToast('没有可清空的记录', '');
        return;
      }

      const panelText = currentPanel === 'all' ? '所有历史记录' : '所有收藏记录';
      const confirmed = await Modal.confirm({
        title: '清空记录',
        message: `确定要清空${panelText}吗？共 ${count} 条记录，删除后无法恢复。`,
        confirmText: '清空',
        cancelText: '取消',
        type: 'danger'
      });

      if (confirmed) {
        if (currentPanel === 'all') {
          History.clear();
        } else {
          // 清空收藏（逐个取消收藏）
          const favorites = History.getFavorites();
          favorites.forEach(fav => {
            History.toggleFavorite(fav);
          });
        }
        renderHistory();
        showToast('已清空', 'success');
      }
    });
  }
}

/* ---------- 热门 CP 排行榜 ---------- */
async function fetchJson(url, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function renderHotRanking(list) {
  const container = document.getElementById('hotRanking');
  if (!container || !list || list.length === 0) return false;

  container.innerHTML = list.map((cp, idx) => {
    const rank = idx + 1;
    const topClass = rank <= 3 ? `top-${rank}` : '';
    const systemLabel = cp.system === 'east' ? '☯ 东方' : '✦ 西方';
    const cpName = cp.nameA && cp.nameB ? `「${cp.nameA}」×「${cp.nameB}」` : '神秘CP';

    return `
      <div class="ranking-card ${topClass}" data-system="${cp.system}" data-a="${cp.a}" data-b="${cp.b}" data-name-a="${cp.nameA || ''}" data-name-b="${cp.nameB || ''}" style="cursor:pointer">
        <div class="rank-badge">${rank}</div>
        <div class="card-cp">${cpName}</div>
        <div class="card-meta">
          <span class="card-system">${systemLabel}</span>
          <span class="card-heat">🔥 ${cp.heat}</span>
        </div>
        ${cp.reason ? `<div class="card-reason">${cp.reason}</div>` : ''}
        <div class="card-action-hint">点击测试这对 CP →</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.ranking-card').forEach(card => {
    card.addEventListener('click', () => {
      const system = card.dataset.system;
      const a = parseInt(card.dataset.a);
      const b = parseInt(card.dataset.b);
      const nameA = card.dataset.nameA;
      const nameB = card.dataset.nameB;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        if (currentSys !== system) {
          setSys(system);
        }

        selection.a = a;
        selection.b = b;

        const nameAInput = document.getElementById('nameA');
        const nameBInput = document.getElementById('nameB');
        if (nameAInput) nameAInput.value = nameA;
        if (nameBInput) nameBInput.value = nameB;

        buildChips();
        applySelection();

        const messages = ['🔮 正在解读命理...', '✨ 计算缘分指数...', '🎯 即将揭晓结果...'];
        let msgIndex = 0;

        function showNextMessage() {
          if (msgIndex < messages.length) {
            showToast(messages[msgIndex], '');
            msgIndex++;
            setTimeout(showNextMessage, 600);
          } else {
            runResult();

            setTimeout(() => {
              const resultEl = document.getElementById('result');
              if (resultEl) {
                resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                resultEl.style.animation = 'resultHighlight 1s ease-out';
                setTimeout(() => {
                  resultEl.style.animation = '';
                }, 1000);
              }
            }, 1900);
          }
        }

        showNextMessage();
      }, 500);
    });
  });

  return true;
}

async function loadHotRanking() {
  const container = document.getElementById('hotRanking');
  if (!container) return;

  let rendered = false;

  // 1. 本地 JSON 立即渲染（不走 PHP API / Redis）
  const preset = await fetchJson('/api/data/hot_cp.json');
  if (Array.isArray(preset) && preset.length > 0) {
    const list = preset
      .slice()
      .sort((a, b) => (b.heat || 0) - (a.heat || 0))
      .slice(0, 8);
    rendered = renderHotRanking(list);
  }

  // 2. 后台 API 刷新实时热度（失败不影响已展示内容）
  try {
    const data = await API.getHot(8);
    if (data?.list?.length) {
      renderHotRanking(data.list);
      rendered = true;
    }
  } catch (e) {
    console.warn('Hot ranking API refresh failed:', e);
  }

  if (!rendered) {
    container.innerHTML = '<div class="ranking-loading">暂无热门 CP 数据</div>';
  }
}

/* ---------- 对比模式渲染 ---------- */
function renderCompare() {
  const box = document.getElementById('compareBox');
  if (!box || !lastResult || !lastResultWest) return;

  const eastR = lastResult.system === 'east' ? lastResult : lastResultWest;
  const westR = lastResult.system === 'west' ? lastResult : lastResultWest;

  const toneLabel = (r) => r.tone === 'gold' ? '金线·高适配' : r.tone === 'red' ? '红线·争议瓜' : '灰线·平淡型';
  const toneColor = (t) => t === 'gold' ? 'var(--gold)' : t === 'red' ? 'var(--red)' : 'var(--gray)';

  box.innerHTML = `
    <div class="compare-col">
      <div class="compare-label" style="color:#9fe2a0">☯ 东方五行</div>
      <div class="compare-score" style="color:${toneColor(eastR.tone)}">${eastR.score}%</div>
      <div class="compare-headline">${eastR.rel || eastR.tags[0] || ''}</div>
      <div class="compare-blurb">${eastR.blurb || ''}</div>
    </div>
    <div class="compare-col">
      <div class="compare-label" style="color:#b57bff">✦ 西方星座</div>
      <div class="compare-score" style="color:${toneColor(westR.tone)}">${westR.score}%</div>
      <div class="compare-headline">${westR.rel || westR.tags[0] || ''}</div>
      <div class="compare-blurb">${westR.blurb || ''}</div>
    </div>
  `;

  // 是否"双解石锤"
  const bothAgree = eastR.tone === westR.tone;
  const verdict = document.getElementById('compareVerdict');
  if (verdict) {
    if (bothAgree) {
      verdict.innerHTML = `<span class="badge">双解石锤 ✓</span> 东西方体系判定一致，这对 CP 的缘分很稳！`;
    } else {
      verdict.innerHTML = `<span class="badge">双解矛盾 !</span> 东方和西方给出不同结论 —— 拉扯感拉满，也是好戏。`;
    }
  }
}

/* ---------- 系统切换 ---------- */
function setSys(s) {
  if (currentSys === s) return;
  currentSys = s;
  selection.a = null;
  selection.b = null;
  document.body.className = 'mode-' + s;
  document.getElementById('nameA').value = '';
  document.getElementById('nameB').value = '';
  document.getElementById('result').classList.remove('show');
  buildWheel();
  buildChips();
}

/* ---------- Footer 年份 / 链接填充 ---------- */
function hydrateFooter() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = SITE_CONFIG.year;
  const sealEl = document.getElementById('footerSeal');
  if (sealEl) sealEl.textContent = SITE_CONFIG.siteName;

  // 应用全局配置
  const siteNameEl = document.getElementById('footerSiteName');
  if (siteNameEl) siteNameEl.textContent = SITE_CONFIG.siteName;
  const brandNameEl = document.getElementById('footerBrandName');
  if (brandNameEl) brandNameEl.textContent = SITE_CONFIG.siteName;
  const sloganEl = document.getElementById('footerSlogan');
  if (sloganEl) sloganEl.textContent = SITE_CONFIG.tdk.description;
  const domainEl = document.getElementById('footerDomain');
  if (domainEl) {
    domainEl.textContent = SITE_CONFIG.domain;
    domainEl.href = SITE_CONFIG.baseUrl;
  }

  // 社交账号
  const socialEl = document.getElementById('footerSocial');
  if (socialEl && SITE_CONFIG.social) {
    socialEl.innerHTML = '';
    for (const [key, info] of Object.entries(SITE_CONFIG.social)) {
      const a = document.createElement('a');
      a.href = info.url || '#';
      a.title = info.name;
      a.setAttribute('aria-label', info.name);
      a.textContent = info.name.charAt(0);
      socialEl.appendChild(a);
    }
  }
}

/* ---------- TDK 应用 ---------- */
function applyTDK() {
  const tdk = SITE_CONFIG.tdk;
  if (!tdk) return;
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = tdk.title;
  const descEl = document.getElementById('pageDesc');
  if (descEl) descEl.content = tdk.description;
  const kwEl = document.getElementById('pageKw');
  if (kwEl) kwEl.content = tdk.keywords;
  const ogUrlEl = document.getElementById('ogUrl');
  if (ogUrlEl) ogUrlEl.content = SITE_CONFIG.baseUrl;
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.content = tdk.title;
  const ogDescEl = document.querySelector('meta[property="og:description"]');
  if (ogDescEl) ogDescEl.content = tdk.description;
  document.title = tdk.title;
}

/* ---------- Toast 提示 ---------- */
let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 2400);
}

/* ---------- 海报弹窗 ---------- */
let posterCanvas = null;
function openPosterModal() {
  if (!lastResult) {
    showToast('请先测一对 CP 再生成海报', 'error');
    return;
  }
  posterCanvas = generatePoster(lastResult);
  const preview = document.getElementById('posterPreview');
  preview.innerHTML = '';
  preview.appendChild(posterCanvas);
  document.getElementById('posterModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closePosterModal() {
  document.getElementById('posterModal').classList.remove('show');
  document.body.style.overflow = '';
}

/* ---------- 分享功能绑定 ---------- */
function bindShare() {
  // 生成海报按钮
  const posterBtn = document.getElementById('sharePoster');
  if (posterBtn) posterBtn.addEventListener('click', openPosterModal);

  // 关闭弹窗
  const closeBtn = document.getElementById('posterClose');
  if (closeBtn) closeBtn.addEventListener('click', closePosterModal);
  const modal = document.getElementById('posterModal');
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) closePosterModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePosterModal();
  });

  // 下载海报
  const dlBtn = document.getElementById('posterDownload');
  if (dlBtn) dlBtn.addEventListener('click', () => {
    if (!posterCanvas) return;
    const name = lastResult ? `${lastResult.nameA}×${lastResult.nameB}` : '吃瓜命理盘';
    downloadPoster(posterCanvas, `吃瓜海报-${name}.png`);
    showToast('海报已保存 ✓', 'success');
  });

  // 弹窗内「发给朋友」
  const posterShareBtn = document.getElementById('posterShare');
  if (posterShareBtn) posterShareBtn.addEventListener('click', async () => {
    if (!lastResult) return;
    const ok = await nativeShare(lastResult, posterCanvas);
    if (!ok) {
      // 系统分享不支持时，降级为复制文案
      const copied = await copyShareText(lastResult);
      showToast(copied ? '文案已复制，去粘贴分享吧' : '复制失败，请手动复制', copied ? 'success' : 'error');
    }
  });

  // 结果卡「复制文案」
  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    if (!lastResult) {
      showToast('请先测一对 CP 再复制', 'error');
      return;
    }
    const ok = await copyShareText(lastResult);
    showToast(ok ? '文案已复制到剪贴板 ✓' : '复制失败', ok ? 'success' : 'error');
  });

  // 结果卡「分享」
  const nativeBtn = document.getElementById('shareNative');
  if (nativeBtn) nativeBtn.addEventListener('click', async () => {
    if (!lastResult) {
      showToast('请先测一对 CP 再分享', 'error');
      return;
    }
    if (!navigator.share) {
      // 降级：复制链接
      try {
        await navigator.clipboard.writeText(location.href);
        showToast('链接已复制，去粘贴分享吧', 'success');
      } catch (e) {
        showToast('您的浏览器不支持分享功能', 'error');
      }
      return;
    }
    const ok = await nativeShare(lastResult, null);
    if (!ok) showToast('分享取消', '');
  });
}

/* ---------- Rosetta Modal（双体系对照弹窗） ---------- */
function bindRosettaModal() {
  const btn = document.getElementById('rosettaDetailBtn');
  const modal = document.getElementById('rosettaModal');
  const closeBtn = document.getElementById('rosettaModalClose');
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!btn || !modal || !closeBtn) return;

  // 打开弹窗
  btn.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  // 关闭弹窗 - 点击关闭按钮
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // 关闭弹窗 - 点击遮罩层
  if (overlay) {
    overlay.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  // 关闭弹窗 - 按 ESC 键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- Design Modal（设计思路弹窗） ---------- */
function bindDesignModal() {
  const btn = document.getElementById('designDetailBtn');
  const modal = document.getElementById('designModal');
  const closeBtn = document.getElementById('designModalClose');
  const overlay = modal ? modal.querySelector('.modal-overlay') : null;

  if (!btn || !modal || !closeBtn) return;

  // 打开弹窗
  btn.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  // 关闭弹窗 - 点击关闭按钮
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // 关闭弹窗 - 点击遮罩层
  if (overlay) {
    overlay.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  // 关闭弹窗 - 按 ESC 键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- 启动 ---------- */
function init() {
  document.body.className = 'mode-east';

  // 切换系统
  document.querySelectorAll('.toggle button').forEach(btn => {
    btn.addEventListener('click', () => setSys(btn.dataset.sys));
  });

  // 主按钮
  document.getElementById('spin').addEventListener('click', runResult);

  // 随机
  document.getElementById('rand').addEventListener('click', () => {
    let a = Math.floor(Math.random() * 12);
    let b = Math.floor(Math.random() * 12);
    if (b === a) b = (b + 1 + Math.floor(Math.random() * 11)) % 12;
    selection.a = a;
    selection.b = b;
    document.getElementById('nameA').value = '';
    document.getElementById('nameB').value = '';
    buildChips();
    applySelection();
    runResult();
  });

  buildWheel();
  buildChips();
  applyTDK();
  hydrateFooter();
  bindShare();
  bindRosettaModal();
  bindDesignModal();
  bindHistoryViewModal();
  UI.init();
  renderHistory();
  bindFavorite();
  bindHistoryTabs();
  // 非关键数据：空闲时再加载，不阻塞首屏交互
  const scheduleHot = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
  scheduleHot(() => loadHotRanking());
}

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
