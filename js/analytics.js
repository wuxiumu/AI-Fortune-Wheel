/**
 * 统计分析模块
 * 页面可交互后再加载第三方统计，避免拖慢首屏
 */

(function () {
  'use strict';

  const LA_WIDGET_SRC = 'https://v6-widget.51.la/v6/KhAJ9Mq8diK1cIAT/quote.js?theme=0&col=true&f=12&badge=icon_0&icon=center';
  const LA_ID = 'KhAJ9Mq8diK1cIAT';

  function loadScript(src, attrs) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
      }
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(script);
    });
  }

  function init51La() {
    // 主统计 SDK
    !function (p) {
      const s = window;
      const e = document;
      const i = p;
      const c = (e.location.protocol === 'https:' ? 'https://' : 'http://') + 'sdk.51.la/js-sdk-pro.min.js';
      const n = e.createElement('script');
      const r = e.getElementsByTagName('script')[0];
      n.type = 'text/javascript';
      n.setAttribute('charset', 'UTF-8');
      n.async = true;
      n.src = c;
      n.id = 'LA_COLLECT';
      i.d = n;
      const o = function () {
        s.LA.ids.push(i);
      };
      if (s.LA) {
        if (s.LA.ids) o();
      } else {
        s.LA = p;
        s.LA.ids = [];
        o();
      }
      r.parentNode.insertBefore(n, r);
    }({ id: LA_ID, ck: LA_ID });

    // 展示挂件（原 index.html 内联脚本）
    loadScript(LA_WIDGET_SRC, {
      crossorigin: 'anonymous',
      charset: 'UTF-8',
      id: 'LA-DATA-WIDGET'
    }).catch(() => {});
  }

  function scheduleAnalytics() {
    const run = () => {
      try {
        init51La();
      } catch (e) {
        console.warn('[analytics]', e);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(run, { timeout: 5000 });
    } else {
      setTimeout(run, 2000);
    }
  }

  if (document.readyState === 'complete') {
    scheduleAnalytics();
  } else {
    window.addEventListener('load', scheduleAnalytics, { once: true });
  }
})();
