/* ============================================================
   share.js — 分享与海报生成
   功能：
     1. Canvas 手绘海报（不依赖第三方库）
     2. 下载海报图片
     3. 复制分享文案
     4. 调用系统分享（Web Share API）
   ============================================================ */

/**
 * 生成吃瓜命理海报
 * @param {Object} data - 配对结果数据
 * @returns {HTMLCanvasElement}
 */
function generatePoster(data) {
  const W = 750;
  const H = 1334;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 背景渐变（按系统切换色调）
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (data.system === 'east') {
    bgGrad.addColorStop(0, '#1a0e24');
    bgGrad.addColorStop(0.4, '#2d1a42');
    bgGrad.addColorStop(1, '#1a0e24');
  } else {
    bgGrad.addColorStop(0, '#0a0a2e');
    bgGrad.addColorStop(0.4, '#1a0e42');
    bgGrad.addColorStop(1, '#0a0a2e');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 装饰圆点（模拟星空）
  ctx.save();
  for (let i = 0; i < 80; i++) {
    const x = (i * 73 + 17) % W;
    const y = (i * 131 + 29) % H;
    const r = (i % 3) * 0.8 + 0.6;
    ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 顶部光晕
  const topGlow = ctx.createRadialGradient(W / 2, 100, 50, W / 2, 100, 400);
  topGlow.addColorStop(0, 'rgba(255,126,179,0.25)');
  topGlow.addColorStop(1, 'rgba(255,126,179,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, 500);

  // 底部光晕
  const btmGlow = ctx.createRadialGradient(W / 2, H - 100, 50, W / 2, H - 100, 400);
  btmGlow.addColorStop(0, 'rgba(91,141,239,0.22)');
  btmGlow.addColorStop(1, 'rgba(91,141,239,0)');
  ctx.fillStyle = btmGlow;
  ctx.fillRect(0, H - 500, W, 500);

  // 顶部标题
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 「吃瓜命理盘」大标题（渐变文字）
  const titleGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  titleGrad.addColorStop(0, '#ff7eb3');
  titleGrad.addColorStop(0.4, '#ff5c9d');
  titleGrad.addColorStop(0.75, '#b57bff');
  titleGrad.addColorStop(1, '#5b8def');
  ctx.fillStyle = titleGrad;
  ctx.font = '900 64px "Noto Serif SC", serif';
  ctx.fillText('吃瓜命理盘', W / 2, 120);

  // 副标题
  ctx.fillStyle = 'rgba(179,172,214,0.85)';
  ctx.font = '400 24px "Noto Sans SC", sans-serif';
  ctx.fillText(
    data.system === 'east' ? '东方五行生肖 · ZODIAC · WU XING' : '西方星盘星座 · ASTRO · ELEMENTS',
    W / 2, 180
  );

  // 装饰分隔线
  ctx.strokeStyle = 'rgba(255,213,107,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, 220);
  ctx.lineTo(W / 2 + 140, 220);
  ctx.stroke();
  ctx.fillStyle = '#ffd56b';
  ctx.beginPath();
  ctx.arc(W / 2, 220, 4, 0, Math.PI * 2);
  ctx.fill();

  // CP 名字（大字）
  ctx.fillStyle = '#f3effc';
  ctx.font = '900 52px "Noto Serif SC", serif';
  ctx.fillText(data.cpText, W / 2, 300);

  // 分数环（中心）
  const ringCx = W / 2;
  const ringCy = 480;
  const ringR = 120;

  // 外圈
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  // 进度弧（渐变色）
  const score = data.score;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * score / 100);
  const scoreGrad = ctx.createLinearGradient(ringCx - ringR, ringCy - ringR, ringCx + ringR, ringCy + ringR);
  scoreGrad.addColorStop(0, '#ff7eb3');
  scoreGrad.addColorStop(1, '#5b8def');
  ctx.strokeStyle = scoreGrad;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // 分数数字
  ctx.fillStyle = '#f3effc';
  ctx.font = '700 88px "Space Mono", monospace';
  ctx.fillText(String(score), ringCx, ringCy - 10);
  ctx.fillStyle = 'rgba(125,118,158,0.9)';
  ctx.font = '400 20px "Space Mono", monospace';
  ctx.fillText('适配度 %', ringCx, ringCy + 45);

  // 关系标签
  const tags = data.tags;
  const tagColor = data.tone === 'gold' ? '#ffd56b' : data.tone === 'red' ? '#ff4d6d' : '#8a83a8';
  const tagBg = data.tone === 'gold'
    ? 'rgba(255,213,107,0.92)'
    : data.tone === 'red'
      ? 'rgba(255,77,109,0.9)'
      : 'rgba(138,131,168,0.28)';
  const tagText = data.tone === 'gold' ? '#221805' : data.tone === 'red' ? '#fff' : '#f3effc';

  // 计算标签宽度，横向排列
  ctx.font = '700 26px "Noto Serif SC", serif';
  let totalW = 0;
  const tagWidths = tags.map(t => {
    const w = ctx.measureText(t).width + 40;
    totalW += w;
    return w;
  });
  totalW += (tags.length - 1) * 16;
  let tagX = (W - totalW) / 2;
  const tagY = 660;

  tags.forEach((t, i) => {
    const tw = tagWidths[i];
    // 标签背景（圆角矩形）
    ctx.fillStyle = tagBg;
    roundRect(ctx, tagX, tagY, tw, 52, 26);
    ctx.fill();
    // 标签文字
    ctx.fillStyle = tagText;
    ctx.textAlign = 'center';
    ctx.fillText(t, tagX + tw / 2, tagY + 28);
    tagX += tw + 16;
  });

  // 评语区（带左边框）
  const blurb = data.blurb;
  ctx.textAlign = 'left';
  ctx.font = '400 24px "Noto Sans SC", sans-serif';
  const blurbX = 100;
  const blurbY = 770;
  const blurbW = W - 200;
  const blurbH = 150;

  // 背景
  ctx.fillStyle = 'rgba(12,10,29,0.45)';
  roundRect(ctx, blurbX - 16, blurbY - 16, blurbW + 32, blurbH + 32, 16);
  ctx.fill();
  // 左边金线
  ctx.fillStyle = '#ffd56b';
  ctx.fillRect(blurbX - 16, blurbY - 16, 4, blurbH + 32);

  // 自动换行绘制文字
  ctx.fillStyle = '#f3effc';
  ctx.font = '400 24px "Noto Sans SC", sans-serif';
  wrapText(ctx, blurb, blurbX, blurbY + 10, blurbW, 36);

  // 东西互译注脚
  if (data.cross) {
    ctx.fillStyle = 'rgba(179,172,214,0.7)';
    ctx.font = '400 20px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, '🌐 ' + data.cross, W / 2, 1000, W - 120, 28, 'center');
  }

  // 底部品牌区
  // 分隔线
  ctx.strokeStyle = 'rgba(150,130,220,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, H - 220);
  ctx.lineTo(W - 100, H - 220);
  ctx.stroke();

  // 「理性吃瓜」印章
  const sealGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
  sealGrad.addColorStop(0, '#ffd56b');
  sealGrad.addColorStop(1, '#ffb938');
  ctx.fillStyle = sealGrad;
  ctx.textAlign = 'center';
  ctx.font = '700 26px "Noto Serif SC", serif';
  ctx.fillText('◆ 理性吃瓜 ◆', W / 2, H - 170);

  // 免责声明
  ctx.fillStyle = 'rgba(125,118,158,0.75)';
  ctx.font = '400 18px "Noto Sans SC", sans-serif';
  ctx.fillText('本轮盘仅作娱乐八卦趣味测算，不构成任何现实判断依据', W / 2, H - 130);

  // 网址
  ctx.fillStyle = '#f3effc';
  ctx.font = '500 22px "Space Mono", monospace';
  ctx.fillText(SITE_CONFIG.domain, W / 2, H - 80);

  // 扫码提示
  ctx.fillStyle = 'rgba(179,172,214,0.6)';
  ctx.font = '400 16px "Noto Sans SC", sans-serif';
  ctx.fillText('长按识别 · 一起磕这对', W / 2, H - 45);

  // 真实二维码（右下角）
  drawQRCode(ctx, W - 200, H - 200, 130, SITE_CONFIG.baseUrl);

  return canvas;
}

/** 圆角矩形辅助 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** 自动换行绘制文字 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
  const originalAlign = ctx.textAlign;
  if (align) ctx.textAlign = align;
  const chars = text.split('');
  let line = '';
  let curY = y;
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, curY);
      line = chars[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  ctx.textAlign = originalAlign;
}

/** 真实二维码（使用 qrcode-generator 库） */
function drawQRCode(ctx, x, y, size, url) {
  // 白色圆角背景
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, size, size, 10);
  ctx.fill();

  try {
    // 使用 qrcode-generator 生成二维码
    const qr = qrcode(0, 'L'); // typeNumber 0 = 自动选择，errorCorrectLevel 'L'
    qr.addData(url);
    qr.make();

    // 获取二维码矩阵
    const moduleCount = qr.getModuleCount();
    const cellSize = (size - 16) / moduleCount; // 16px 边距
    const offsetX = x + 8;
    const offsetY = y + 8;

    // 绘制二维码
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            offsetX + col * cellSize,
            offsetY + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  } catch (e) {
    console.error('QR code generation failed:', e);
    // 降级：绘制占位符
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR', x + size / 2, y + size / 2);
  }
}

/**
 * 下载海报
 */
function downloadPoster(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || '吃瓜命理盘海报.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

/**
 * 生成分享文案
 */
function buildShareText(data) {
  const toneLabel = data.tone === 'gold' ? '金线·高适配' : data.tone === 'red' ? '红线·争议瓜' : '灰线·平淡型';
  return `【吃瓜命理盘】${data.cpText}\n`
    + `${data.tags.join(' · ')} · ${toneLabel}\n`
    + `适配度 ${data.score}%\n`
    + `${data.blurb}\n`
    + `— 东西双解 · 理性吃瓜 —\n`
    + `51chigua.solutions`;
}

/**
 * 调用系统原生分享（Web Share API）
 */
async function nativeShare(data, canvas) {
  if (!navigator.share) return false;
  try {
    // 尝试带图分享
    if (canvas && navigator.canShare) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'poster.png', { type: 'image/png' });
        const shareData = {
          title: '吃瓜命理盘',
          text: buildShareText(data),
          files: [file]
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.share({
            title: '吃瓜命理盘',
            text: buildShareText(data),
            url: location.href
          });
        }
      }, 'image/png');
      return true;
    }
    await navigator.share({
      title: '吃瓜命理盘',
      text: buildShareText(data),
      url: location.href
    });
    return true;
  } catch (e) {
    if (e.name === 'AbortError') return true; // 用户取消
    return false;
  }
}

/**
 * 复制文案到剪贴板
 */
async function copyShareText(data) {
  const text = buildShareText(data);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // 兜底方案
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
