/* ============================================================
   ui.js — 明星搜索、生日换算、Tab 切换等 UI 交互
   ============================================================ */

const UI = (() => {
  let searchTimeout = null;

  /**
   * 初始化所有 UI 交互
   */
  function init() {
    initTabs();
    initStarSearch();
    initBirthCalc();
    // 明星库空闲时加载，搜索聚焦时会按需再拉
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    schedule(() => {
      StarsDB.load().then(() => {
        console.log('Stars database loaded:', StarsDB.getAll().length, 'stars');
      });
    });
  }

  /**
   * Tab 切换
   */
  function initTabs() {
    document.querySelectorAll('.picker').forEach(picker => {
      const side = picker.dataset.side;
      const tabs = picker.querySelectorAll('.tab-btn');
      const contents = picker.querySelectorAll('.tab-content');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          contents.forEach(c => c.classList.add('hidden'));
          const targetContent = picker.querySelector(`#tab${target.charAt(0).toUpperCase() + target.slice(1)}${side.toUpperCase()}`);
          if (targetContent) targetContent.classList.remove('hidden');
        });
      });
    });
  }

  /**
   * 明星搜索
   */
  function initStarSearch() {
    ['A', 'B'].forEach(side => {
      const input = document.getElementById(`search${side}`);
      const results = document.getElementById(`searchResults${side}`);

      const render = (keyword) => {
        const grouped = StarsDB.searchGrouped(keyword);
        renderGroupedResults(grouped, results, side.toLowerCase(), !!keyword);
      };

      input.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        clearTimeout(searchTimeout);

        if (!keyword) {
          // 空输入时仍推荐热门（保持下拉打开）
          render('');
          return;
        }

        searchTimeout = setTimeout(() => render(keyword), 200);
      });

      // 点击输入框时：显示热门明星（男左女右各 5）
      input.addEventListener('focus', async () => {
        if (!StarsDB.getAll().length) {
          await StarsDB.load();
        }
        const keyword = input.value.trim();
        render(keyword);
      });

      // 点击外部关闭搜索结果
      document.addEventListener('click', (e) => {
        if (!e.target.closest(`#search${side}`) && !e.target.closest(`#searchResults${side}`)) {
          results.innerHTML = '';
        }
      });
    });
  }

  /**
   * 渲染分组搜索结果（男左女右）
   */
  function renderGroupedResults(grouped, container, side, isSearch) {
    const { males, females } = grouped;

    if (males.length === 0 && females.length === 0) {
      container.innerHTML = '<div class="star-item"><div class="star-name">未找到匹配的明星</div></div>';
      return;
    }

    const renderCol = (list, label, icon, cls) => {
      if (list.length === 0) return '';
      const title = isSearch ? `${label} · ${list.length}` : `${icon} ${label} · 热门`;
      return `
        <div class="star-col ${cls}">
          <div class="star-col-title">${title}</div>
          ${list.map(star => `
            <div class="star-item" data-name="${star.name.replace(/"/g, '&quot;')}" data-zodiac="${star.zodiac}" data-constellation="${star.constellation}">
              <div class="star-name">${star.name}</div>
              <div class="star-meta">
                <span>🐾 ${star.zodiac}</span>
                <span>⭐ ${star.constellation}</span>
              </div>
              <div class="star-tags-row">${star.tags.slice(0, 2).map(t => `<span class="star-tag">${t}</span>`).join('')}</div>
            </div>
          `).join('')}
        </div>
      `;
    };

    container.innerHTML = `
      <div class="star-gender-split">
        ${renderCol(males, '男明星', '♂', 'col-male')}
        ${renderCol(females, '女明星', '♀', 'col-female')}
      </div>
    `;

    // 绑定点击事件
    container.querySelectorAll('.star-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.dataset.name;
        const zodiac = item.dataset.zodiac;
        const constellation = item.dataset.constellation;
        selectStar(side, name, zodiac, constellation);
        container.innerHTML = '';
      });
    });
  }

  /**
   * 选中明星
   */
  function selectStar(side, name, zodiac, constellation) {
    // 设置名字
    const nameInput = document.getElementById(`name${side.toUpperCase()}`);
    if (nameInput) nameInput.value = name;

    // 切换到手动选择 tab
    const picker = document.querySelector(`.picker[data-side="${side}"]`);
    const manualTab = picker.querySelector('[data-tab="manual"]');
    if (manualTab) manualTab.click();

    // 选中对应的生肖和星座
    const zodiacIdx = StarsDB.ZODIAC_MAP[zodiac];
    const constIdx = StarsDB.CONSTELLATION_MAP[constellation];

    // 根据当前系统选择对应的索引
    if (currentSys === 'east') {
      selection[side] = zodiacIdx;
    } else {
      selection[side] = constIdx;
    }

    buildChips();
    applySelection();
    maybeAuto();
  }

  /**
   * 生日换算
   */
  function initBirthCalc() {
    ['A', 'B'].forEach(side => {
      const input = document.getElementById(`birth${side}`);
      const result = document.getElementById(`birthResult${side}`);

      input.addEventListener('change', (e) => {
        const dateStr = e.target.value;
        if (!dateStr) {
          result.innerHTML = '';
          return;
        }

        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const zodiac = StarsDB.getZodiac(year);
        const constellation = StarsDB.getConstellation(month, day);

        result.innerHTML = `
          <div class="birth-info">
            <div class="zodiac">
              <div class="label">生肖</div>
              <div class="value">${zodiac}</div>
            </div>
            <div class="arrow">→</div>
            <div class="constellation">
              <div class="label">星座</div>
              <div class="value">${constellation}</div>
            </div>
          </div>
        `;

        // 自动选择对应选项
        const zodiacIdx = StarsDB.ZODIAC_MAP[zodiac];
        const constIdx = StarsDB.CONSTELLATION_MAP[constellation];

        if (currentSys === 'east') {
          selection[side] = zodiacIdx;
        } else {
          selection[side] = constIdx;
        }

        buildChips();
        applySelection();
        maybeAuto();
      });
    });
  }

  return { init, selectStar };
})();
