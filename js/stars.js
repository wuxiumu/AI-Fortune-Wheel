/* ============================================================
   stars.js — 明星数据库
   加载明星数据，提供搜索和自动匹配功能
   ============================================================ */

const StarsDB = (() => {
  let stars = [];
  let loaded = false;

  // 生肖到地支索引映射
  const ZODIAC_MAP = {
    '鼠': 0, '牛': 1, '虎': 2, '兔': 3, '龙': 4, '蛇': 5,
    '马': 6, '羊': 7, '猴': 8, '鸡': 9, '狗': 10, '猪': 11
  };

  // 星座到索引映射
  const CONSTELLATION_MAP = {
    '白羊': 0, '金牛': 1, '双子': 2, '巨蟹': 3, '狮子': 4, '处女': 5,
    '天秤': 6, '天蝎': 7, '射手': 8, '摩羯': 9, '水瓶': 10, '双鱼': 11
  };

  const FETCH_TIMEOUT = 3000;

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
  }

  /**
   * 加载明星数据（优先静态 JSON，避免首屏走 PHP API）
   */
  async function load() {
    if (loaded) return stars;

    const staticData = await fetchWithTimeout('/api/data/stars.json');
    if (Array.isArray(staticData) && staticData.length > 0) {
      stars = staticData;
      loaded = true;
      return stars;
    }

    try {
      const data = await fetchWithTimeout(SITE_CONFIG.apiBase + '/stars');
      stars = data?.data?.list || [];
      loaded = true;
      return stars;
    } catch (e) {
      console.warn('Failed to load stars data:', e);
      return [];
    }
  }

  /**
   * 搜索明星
   */
  function search(keyword) {
    if (!keyword) return stars.slice(0, 20);
    const kw = keyword.toLowerCase();
    return stars.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.tags.some(t => t.toLowerCase().includes(kw))
    ).slice(0, 20);
  }

  /**
   * 根据生日计算生肖
   */
  function getZodiac(year) {
    const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const index = (year - 4) % 12;
    return zodiacAnimals[index >= 0 ? index : index + 12];
  }

  /**
   * 根据生日计算星座
   */
  function getConstellation(month, day) {
    const constellations = [
      { name: '摩羯', start: [1, 1], end: [1, 19] },
      { name: '水瓶', start: [1, 20], end: [2, 18] },
      { name: '双鱼', start: [2, 19], end: [3, 20] },
      { name: '白羊', start: [3, 21], end: [4, 19] },
      { name: '金牛', start: [4, 20], end: [5, 20] },
      { name: '双子', start: [5, 21], end: [6, 21] },
      { name: '巨蟹', start: [6, 22], end: [7, 22] },
      { name: '狮子', start: [7, 23], end: [8, 22] },
      { name: '处女', start: [8, 23], end: [9, 22] },
      { name: '天秤', start: [9, 23], end: [10, 23] },
      { name: '天蝎', start: [10, 24], end: [11, 22] },
      { name: '射手', start: [11, 23], end: [12, 21] },
      { name: '摩羯', start: [12, 22], end: [12, 31] }
    ];

    for (const c of constellations) {
      const [sm, sd] = c.start;
      const [em, ed] = c.end;
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return c.name;
      }
    }
    return '摩羯';
  }

  /**
   * 根据生日自动匹配明星数据
   */
  function matchByBirth(year, month, day) {
    const zodiac = getZodiac(year);
    const constellation = getConstellation(month, day);
    const zodiacIdx = ZODIAC_MAP[zodiac];
    const constIdx = CONSTELLATION_MAP[constellation];

    // 先找完全匹配的
    const exact = stars.find(s => s.zodiac === zodiac && s.constellation === constellation);
    if (exact) return { star: exact, zodiacIdx, constIdx };

    // 找星座匹配的
    const byConst = stars.find(s => s.constellation === constellation);
    if (byConst) return { star: byConst, zodiacIdx, constIdx };

    // 找生肖匹配的
    const byZodiac = stars.find(s => s.zodiac === zodiac);
    if (byZodiac) return { star: byZodiac, zodiacIdx, constIdx };

    // 都不匹配，返回索引
    return { star: null, zodiacIdx, constIdx };
  }

  /**
   * 按性别分组并推荐热门明星（男左女右）
   * @param {number} topN 每组取多少个，默认 5
   * @returns {{males: Array, females: Array}}
   */
  function getHotByGender(topN = 5) {
    const males = stars.filter(s => s.gender === 'M').slice(0, topN);
    const females = stars.filter(s => s.gender === 'F').slice(0, topN);
    return { males, females };
  }

  /**
   * 搜索明星（按性别分组，男左女右）
   */
  function searchGrouped(keyword) {
    const pool = keyword ? stars.filter(s =>
      s.name.toLowerCase().includes(keyword.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()))
    ) : stars;
    return {
      males: pool.filter(s => s.gender === 'M').slice(0, 10),
      females: pool.filter(s => s.gender === 'F').slice(0, 10)
    };
  }

  /**
   * 获取所有明星（用于下拉）
   */
  function getAll() {
    return stars;
  }

  /**
   * 根据名字获取明星
   */
  function getByName(name) {
    return stars.find(s => s.name === name);
  }

  return {
    load,
    search,
    searchGrouped,
    getHotByGender,
    matchByBirth,
    getAll,
    getByName,
    getZodiac,
    getConstellation,
    ZODIAC_MAP,
    CONSTELLATION_MAP
  };
})();
