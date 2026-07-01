/* ============================================================
   config.js — 全局配置
   修改此文件即可整站生效（域名、TDK、社交账号、联系方式等）
   ============================================================ */

const SITE_CONFIG = {

  /* ---------- 站点基础 ---------- */
  domain: 'ml.chiguashentan.com',                // 主域名（用于海报二维码、页脚等）
  baseUrl: 'https://ml.chiguashentan.com',       // 完整 URL（带协议）
  siteName: '吃瓜命理盘',                       // 站点名称
  siteNameEn: 'Melon Destiny Wheel',           // 英文名称
  version: '1.1.0',
  author: 'chiguashentan',
  year: new Date().getFullYear(),

  /* ---------- TDK（SEO） ---------- */
  tdk: {
    title: '吃瓜命理盘 · 东西双体系CP速测',
    description: '明星CP配对 · 绯闻缘分速测 · 五行/星座双解 · 仅供娱乐吃瓜。东方五行生肖 × 西方星盘星座，双体系对照，双解石锤。',
    keywords: '吃瓜,命理,CP配对,星座配对,五行生肖, Zodiac,星座,生肖,娱乐圈,八卦,明星CP,缘分测试,双解'
  },

  /* ---------- 社交账号 ---------- */
  social: {
    weibo:      { name: '微博',     handle: '@吃瓜命理盘', url: '#' },
    xiaohongshu:{ name: '小红书',   handle: '@吃瓜命理盘', url: '#' },
    douyin:     { name: '抖音',     handle: '@吃瓜命理盘', url: '#' },
    bilibili:   { name: 'B站',      handle: '吃瓜命理盘官方', url: '#' }
  },

  /* ---------- 联系方式 ---------- */
  contact: {
    business: 'business@51chigua.solutions',
    feedback: 'feedback@51chigua.solutions',
    legal:    'legal@51chigua.solutions',
    general:  'contact@51chigua.solutions'
  },

  /* ---------- API ---------- */
  apiBase: '/api',

  /* ---------- 主题 ---------- */
  theme: {
    defaultSystem: 'east',          // 默认体系（east / west）
    enableCompare: true,            // 是否启用对比模式
    enableShare: true,              // 是否启用分享
    enableHotCp: true               // 是否启用热门 CP
  },

  /* ---------- 功能开关 ---------- */
  features: {
    posterQR: true,                 // 海报二维码
    nativeShare: true,              // 系统原生分享
    copyText: true,                 // 复制文案
    wheelClick: true,               // 盘面点击选择
    wheelAnimation: true            // 转盘动画
  }
};

/* 兼容旧代码：暴露为全局 SITE_META */
const SITE_META = {
  name: SITE_CONFIG.siteName,
  slogan: SITE_CONFIG.tdk.description,
  version: SITE_CONFIG.version,
  author: SITE_CONFIG.author,
  year: SITE_CONFIG.year,
  links: {
    about: 'pages/about.html',
    disclaimer: 'pages/disclaimer.html',
    faq: 'pages/faq.html',
    contact: 'pages/contact.html'
  }
};
