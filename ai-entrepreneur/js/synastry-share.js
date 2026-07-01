/* ============================================================
   synastry-share.js — 合盘页分享与海报（复用主站 QR / 下载逻辑）
   ============================================================ */

let synastryPosterCanvas = null;

/** 合盘页分享链接（二维码统一指向此页） */
function getSynastryShareUrl() {
  if (/^localhost$|^127\.0\.0\.1$/.test(location.hostname)) {
    return `${location.origin}/ai-entrepreneur/synastry.html`;
  }
  const base = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.baseUrl)
    ? SITE_CONFIG.baseUrl.replace(/\/$/, '')
    : location.origin;
  return `${base}/ai-entrepreneur/synastry.html`;
}

function buildSynastrySnap() {
  const last = window.LAST;
  if (!last || !last.A || !last.B || !last.r) return null;
  const { A, B, r, interpret = {} } = last;
  const tags = [r.rel, r.elTag, r.tone === 'gold' ? '金线·高适配' : r.tone === 'red' ? '红线·待磨合' : '灰线·平稳'];
  return {
    cpText: `「${A.name}」 × 「${B.name}」`,
    nameA: A.name,
    nameB: B.name,
    score: r.score,
    tone: r.tone,
    tags,
    headline: interpret.headline || '',
    verdict: interpret.verdict || '',
    posterLine: interpret.posterLine || `${r.rel} · 适配度 ${r.score}%`,
    metaA: `${A.dz.branch}${A.dz.animal} · ${A.dz.el} · ${A.dz.west}`,
    metaB: `${B.dz.branch}${B.dz.animal} · ${B.dz.el} · ${B.dz.west}`,
    emojiA: (typeof zodiacIcon === 'function' ? zodiacIcon(A.dz) : A.dz.emoji) || A.dz.animal,
    emojiB: (typeof zodiacIcon === 'function' ? zodiacIcon(B.dz) : B.dz.emoji) || B.dz.animal
  };
}

function buildSynastryShareText(snap) {
  return `【AI 创投命理合盘】${snap.cpText}\n`
    + `${snap.tags.join(' · ')}\n`
    + `适配度 ${snap.score}%\n`
    + `${snap.headline}\n`
    + `${snap.verdict}\n`
    + `— 扫码体验合盘 · 仅供娱乐 —\n`
    + getSynastryShareUrl();
}

function showSynastryToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + (type || '');
  clearTimeout(window._synToastTimer);
  window._synToastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/**
 * Canvas 绘制合盘海报（含二维码，与主站同一套生成方式）
 */
function generateSynastryPoster(snap) {
  const W = 750;
  const H = 1334;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a1028');
  bgGrad.addColorStop(0.45, '#121a3a');
  bgGrad.addColorStop(1, '#080c1c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 60; i++) {
    const x = (i * 97 + 31) % W;
    const y = (i * 149 + 47) % H;
    ctx.globalAlpha = 0.15 + (i % 4) * 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, (i % 3) * 0.7 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const topGlow = ctx.createRadialGradient(W / 2, 120, 40, W / 2, 120, 380);
  topGlow.addColorStop(0, 'rgba(96,165,250,0.28)');
  topGlow.addColorStop(1, 'rgba(96,165,250,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, 480);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleGrad = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
  titleGrad.addColorStop(0, '#60a5fa');
  titleGrad.addColorStop(0.5, '#a78bfa');
  titleGrad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = titleGrad;
  ctx.font = '900 56px "Noto Serif SC", serif';
  ctx.fillText('AI 创投命理合盘', W / 2, 110);

  ctx.fillStyle = 'rgba(179,172,214,0.85)';
  ctx.font = '400 22px "Noto Sans SC", sans-serif';
  ctx.fillText('企业家 × 企业 · 人 × 人 · 企业 × 企业', W / 2, 168);

  ctx.strokeStyle = 'rgba(240,200,105,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 130, 210);
  ctx.lineTo(W / 2 + 130, 210);
  ctx.stroke();

  ctx.fillStyle = '#f3effc';
  ctx.font = '900 44px "Noto Serif SC", serif';
  wrapText(ctx, snap.cpText, W / 2, 270, W - 100, 52, 'center');

  const ringCy = 470;
  const ringR = 108;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(W / 2, ringCy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  const toneColor = snap.tone === 'gold' ? '#ffd56b' : snap.tone === 'red' ? '#ff4d6d' : '#8a83a8';
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * snap.score / 100);
  ctx.strokeStyle = toneColor;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(W / 2, ringCy, ringR, startAngle, endAngle);
  ctx.stroke();

  ctx.fillStyle = '#f3effc';
  ctx.font = '900 72px "Space Mono", monospace';
  ctx.fillText(String(snap.score), W / 2, ringCy - 8);
  ctx.fillStyle = 'rgba(179,172,214,0.8)';
  ctx.font = '400 20px "Noto Sans SC", sans-serif';
  ctx.fillText('适配度 %', W / 2, ringCy + 42);

  const sideY = 640;
  ctx.font = '48px sans-serif';
  ctx.fillText(snap.emojiA, W / 2 - 200, sideY);
  ctx.fillText(snap.emojiB, W / 2 + 200, sideY);
  ctx.fillStyle = '#f3effc';
  ctx.font = '700 28px "Noto Serif SC", serif';
  ctx.fillText(snap.nameA, W / 2 - 200, sideY + 50);
  ctx.fillText(snap.nameB, W / 2 + 200, sideY + 50);
  ctx.fillStyle = 'rgba(179,172,214,0.75)';
  ctx.font = '400 18px "Noto Sans SC", sans-serif';
  wrapText(ctx, snap.metaA, W / 2 - 200, sideY + 82, 220, 24, 'center');
  wrapText(ctx, snap.metaB, W / 2 + 200, sideY + 82, 220, 24, 'center');

  ctx.fillStyle = toneColor;
  ctx.font = '800 34px "Noto Serif SC", serif';
  wrapText(ctx, snap.headline, W / 2, 780, W - 120, 42, 'center');

  ctx.fillStyle = 'rgba(243,239,252,0.92)';
  ctx.font = '400 26px "Noto Sans SC", sans-serif';
  wrapText(ctx, snap.verdict, W / 2, 860, W - 120, 38, 'center');

  ctx.fillStyle = 'rgba(255,213,107,0.9)';
  ctx.font = '600 24px "Noto Sans SC", sans-serif';
  wrapText(ctx, snap.posterLine, W / 2, 980, W - 120, 34, 'center');

  ctx.strokeStyle = 'rgba(150,130,220,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, H - 220);
  ctx.lineTo(W - 100, H - 220);
  ctx.stroke();

  ctx.fillStyle = '#ffd56b';
  ctx.font = '700 24px "Noto Serif SC", serif';
  ctx.fillText('◆ 理性合盘 · 趣味创投 ◆', W / 2, H - 170);

  ctx.fillStyle = 'rgba(125,118,158,0.75)';
  ctx.font = '400 17px "Noto Sans SC", sans-serif';
  ctx.fillText('本海报为娱乐趣味内容，不构成任何投资或经营判断依据', W / 2, H - 132);

  const domain = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.domain)
    ? SITE_CONFIG.domain
    : location.host;
  ctx.fillStyle = '#f3effc';
  ctx.font = '500 20px "Space Mono", monospace';
  ctx.fillText(domain, W / 2, H - 88);

  ctx.fillStyle = 'rgba(179,172,214,0.6)';
  ctx.font = '400 16px "Noto Sans SC", sans-serif';
  ctx.fillText('长按识别 · 体验 AI 创投合盘', W / 2, H - 48);

  drawQRCode(ctx, W - 200, H - 200, 130, getSynastryShareUrl());

  return canvas;
}

async function synastryNativeShare(snap, canvas) {
  if (!navigator.share) return false;
  const text = buildSynastryShareText(snap);
  try {
    if (canvas && navigator.canShare) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const file = new File([blob], 'synastry-poster.png', { type: 'image/png' });
        const shareData = { title: 'AI 创投命理合盘', text, files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return true;
        }
      }
    }
    await navigator.share({ title: 'AI 创投命理合盘', text, url: getSynastryShareUrl() });
    return true;
  } catch (e) {
    if (e.name === 'AbortError') return true;
    return false;
  }
}

async function synastryCopyShareText(snap) {
  const text = buildSynastryShareText(snap);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(ta);
    return ok;
  }
}

function openSynastryPosterModal() {
  const snap = buildSynastrySnap();
  if (!snap) {
    showSynastryToast('请先完成合盘再生成海报', 'error');
    return;
  }
  synastryPosterCanvas = generateSynastryPoster(snap);
  const preview = document.getElementById('posterPreview');
  preview.innerHTML = '';
  preview.appendChild(synastryPosterCanvas);
  document.getElementById('posterModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSynastryPosterModal() {
  document.getElementById('posterModal').classList.remove('show');
  document.body.style.overflow = '';
}

function bindSynastryShare() {
  const posterBtn = document.getElementById('sharePoster');
  if (posterBtn) posterBtn.addEventListener('click', openSynastryPosterModal);

  const closeBtn = document.getElementById('posterClose');
  if (closeBtn) closeBtn.addEventListener('click', closeSynastryPosterModal);

  const modal = document.getElementById('posterModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSynastryPosterModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSynastryPosterModal();
  });

  const dlBtn = document.getElementById('posterDownload');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      if (!synastryPosterCanvas) return;
      const snap = buildSynastrySnap();
      const name = snap ? `${snap.nameA}×${snap.nameB}` : '合盘';
      downloadPoster(synastryPosterCanvas, `合盘海报-${name}.png`);
      showSynastryToast('海报已保存 ✓', 'success');
    });
  }

  const posterShareBtn = document.getElementById('posterShare');
  if (posterShareBtn) {
    posterShareBtn.addEventListener('click', async () => {
      const snap = buildSynastrySnap();
      if (!snap) return;
      const ok = await synastryNativeShare(snap, synastryPosterCanvas);
      if (!ok) {
        const copied = await synastryCopyShareText(snap);
        showSynastryToast(copied ? '文案已复制，去粘贴分享吧' : '复制失败，请手动复制', copied ? 'success' : 'error');
      }
    });
  }

  const copyBtn = document.getElementById('shareCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const snap = buildSynastrySnap();
      if (!snap) {
        showSynastryToast('请先完成合盘再复制', 'error');
        return;
      }
      const ok = await synastryCopyShareText(snap);
      showSynastryToast(ok ? '文案已复制到剪贴板 ✓' : '复制失败', ok ? 'success' : 'error');
    });
  }

  const nativeBtn = document.getElementById('shareNative');
  if (nativeBtn) {
    nativeBtn.addEventListener('click', async () => {
      const snap = buildSynastrySnap();
      if (!snap) {
        showSynastryToast('请先完成合盘再分享', 'error');
        return;
      }
      if (!navigator.share) {
        try {
          await navigator.clipboard.writeText(getSynastryShareUrl());
          showSynastryToast('链接已复制，去粘贴分享吧', 'success');
        } catch (e) {
          showSynastryToast('您的浏览器不支持分享功能', 'error');
        }
        return;
      }
      const ok = await synastryNativeShare(snap, null);
      if (!ok) showSynastryToast('分享取消', '');
    });
  }
}

document.addEventListener('DOMContentLoaded', bindSynastryShare);
