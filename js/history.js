/* ============================================================
   history.js — 收藏/历史记录管理
   使用 localStorage 持久化用户查看的配对结果
   ============================================================ */

const History = (() => {
  const STORAGE_KEY = '51chigua_history';
  const FAVORITES_KEY = '51chigua_favorites';
  const MAX_HISTORY = 50;

  /**
   * 获取所有历史记录
   */
  function getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load history:', e);
      return [];
    }
  }

  /**
   * 保存配对结果到历史
   */
  function save(result) {
    const history = getAll();
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      system: result.system,
      cpText: result.cpText,
      nameA: result.nameA,
      nameB: result.nameB,
      score: result.score,
      tone: result.tone,
      tags: result.tags || [],
      headline: result.headline || '',
      blurb: result.blurb || '',
      cross: result.cross || '',
      selectionA: result.selectionA,
      selectionB: result.selectionB
    };

    // 添加到开头
    history.unshift(record);

    // 限制数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return record;
    } catch (e) {
      console.error('Failed to save history:', e);
      return null;
    }
  }

  /**
   * 删除历史记录
   */
  function remove(id) {
    const history = getAll();
    const filtered = history.filter(r => r.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to remove history:', e);
      return false;
    }
  }

  /**
   * 清空历史
   */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear history:', e);
      return false;
    }
  }

  /**
   * 收藏管理
   */
  function getFavorites() {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load favorites:', e);
      return [];
    }
  }

  function toggleFavorite(result) {
    const favorites = getFavorites();
    const idx = favorites.findIndex(r =>
      r.system === result.system &&
      r.nameA === result.nameA &&
      r.nameB === result.nameB
    );

    if (idx >= 0) {
      // 已收藏，取消收藏
      favorites.splice(idx, 1);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return { action: 'removed', favorites };
      } catch (e) {
        console.error('Failed to update favorites:', e);
        return { action: 'error', favorites };
      }
    } else {
      // 未收藏，添加收藏
      const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        system: result.system,
        cpText: result.cpText,
        nameA: result.nameA,
        nameB: result.nameB,
        score: result.score,
        tone: result.tone,
        tags: result.tags || [],
        headline: result.headline || '',
        blurb: result.blurb || '',
        cross: result.cross || '',
        selectionA: result.selectionA,
        selectionB: result.selectionB
      };
      favorites.unshift(record);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return { action: 'added', favorites };
      } catch (e) {
        console.error('Failed to add favorite:', e);
        return { action: 'error', favorites };
      }
    }
  }

  function isFavorite(result) {
    const favorites = getFavorites();
    return favorites.some(r =>
      r.system === result.system &&
      r.nameA === result.nameA &&
      r.nameB === result.nameB
    );
  }

  /**
   * 统计信息
   */
  function getStats() {
    const history = getAll();
    const favorites = getFavorites();
    return {
      historyCount: history.length,
      favoriteCount: favorites.length,
      lastCalc: history.length > 0 ? history[0].timestamp : null
    };
  }

  return {
    getAll,
    save,
    remove,
    clear,
    getFavorites,
    toggleFavorite,
    isFavorite,
    getStats
  };
})();
