/* ============================================================
   api.js — 后端 API 调用封装
   功能：
     - 调用后端 /api/calc 计算结果（可选，与本地计算互补）
     - 拉取热门 CP
     - 提交反馈
     - 加载 i18n 文案
     - 降级处理（后端不可用时自动回退到本地计算）
   ============================================================ */

const API = (() => {
  const BASE = '/api';

  /** 通用请求 */
  async function request(method, path, body = null, timeout = 3000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(BASE + path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });
      clearTimeout(timer);
      const json = await res.json();
      if (json.code !== 0) {
        throw new Error(json.message || '请求失败');
      }
      return json.data;
    } catch (err) {
      clearTimeout(timer);
      console.warn('[API]', path, err.message);
      return null; // 降级：返回 null，由调用方处理
    }
  }

  return {
    /** 计算配对结果（后端） */
    calc(system, a, b, nameA, nameB) {
      return request('POST', '/calc', { system, a, b, nameA, nameB });
    },

    /** 热门 CP */
    getHot(count = 10, system = '') {
      const q = system ? `?count=${count}&system=${system}` : `?count=${count}`;
      return request('GET', '/hot' + q);
    },

    /** 增加热度 */
    incrHot(system, a, b) {
      return request('POST', '/hot/incr', { system, a, b });
    },

    /** 全站统计 */
    getStats() {
      return request('GET', '/stats');
    },

    /** 加载 i18n */
    getI18n(lang = 'zh') {
      return request('GET', `/i18n/${lang}`);
    },

    /** 提交反馈 */
    submitFeedback(type, content, contact = '') {
      return request('POST', '/feedback', { type, content, contact });
    },

    /** 保存分享 */
    saveShare(data) {
      return request('POST', '/share', { data });
    },

    /** 获取分享 */
    getShare(id) {
      return request('GET', `/share/${id}`);
    },

    /** 获取历史 */
    getHistory(id) {
      return request('GET', `/history/${id}`);
    }
  };
})();
