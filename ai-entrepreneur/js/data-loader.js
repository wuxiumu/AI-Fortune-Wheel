/**
 * AI 企业家版 · 数据加载
 * 优先读本地 JSON，避免每次请求走 PHP 解析 Markdown
 */
const AIData = (() => {
  const TIMEOUT = 3000;

  async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
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

  async function loadList(staticUrl, apiUrl) {
    const cached = await fetchJson(staticUrl);
    if (cached?.data?.length) return cached.data;

    const api = await fetchJson(apiUrl);
    return api?.data || [];
  }

  return {
    loadPersonalities() {
      return loadList('data/personalities.json', 'api/personalities.php');
    },
    loadCompanies() {
      return loadList('data/companies.json', 'api/companies.php');
    }
  };
})();
