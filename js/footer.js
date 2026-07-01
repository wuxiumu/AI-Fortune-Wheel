/* ============================================================
   footer.js — 页脚填充（主站与子页共用）
   ============================================================ */

function hydrateFooter(options = {}) {
  const cfg = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
  if (!cfg) return;

  const subBrand = options.subBrand || null;
  const subSlogan = options.subSlogan || null;

  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = cfg.year;

  const sealEl = document.getElementById('footerSeal');
  if (sealEl) sealEl.textContent = '◆ 理性吃瓜 ◆';

  const siteNameEl = document.getElementById('footerSiteName');
  if (siteNameEl) siteNameEl.textContent = cfg.siteName;

  const brandNameEl = document.getElementById('footerBrandName');
  if (brandNameEl) brandNameEl.textContent = subBrand || cfg.siteName;

  const sloganEl = document.getElementById('footerSlogan');
  if (sloganEl) sloganEl.textContent = subSlogan || cfg.tdk.description;

  const domainEl = document.getElementById('footerDomain');
  if (domainEl) {
    domainEl.textContent = cfg.domain;
    domainEl.href = cfg.baseUrl;
  }

  const socialEl = document.getElementById('footerSocial');
  if (socialEl && cfg.social) {
    socialEl.innerHTML = '';
    for (const info of Object.values(cfg.social)) {
      const a = document.createElement('a');
      a.href = info.url || '#';
      a.title = info.name;
      a.setAttribute('aria-label', info.name);
      a.textContent = info.name.charAt(0);
      socialEl.appendChild(a);
    }
  }

  document.querySelectorAll('[data-back-top]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => hydrateFooter(window.__FOOTER_OPTS));
} else {
  hydrateFooter(window.__FOOTER_OPTS);
}
