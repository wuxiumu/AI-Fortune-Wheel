# QR Code 开源库使用说明

## 概述

本项目使用 **qrcode-generator** 开源库生成二维码，这是一个成熟、稳定的 QR Code 生成解决方案。

## 库信息

- **名称**：qrcode-generator
- **作者**：Kazuhiko Arase
- **GitHub**：https://github.com/kazuhikoarase/qrcode-generator
- **协议**：MIT License
- **特点**：
  - 纯 JavaScript 实现，无外部依赖
  - 支持所有 QR Code 版本（1-40）
  - 支持多种纠错级别（L/M/Q/H）
  - 支持多种数据模式（数字/字母/字节/汉字）
  - 文件小，性能优秀

## 使用方法

### 1. 基本用法

```javascript
// 创建 QR Code 实例
const qr = qrcode(0, 'L'); 
// 参数1: typeNumber (0 = 自动选择版本，1-40 = 指定版本)
// 参数2: errorCorrectLevel ('L', 'M', 'Q', 'H')

// 添加数据
qr.addData('https://51chigua.solutions');

// 生成二维码
qr.make();

// 检查某个位置是否为黑色
const isDark = qr.isDark(row, col);

// 获取模块数量
const moduleCount = qr.getModuleCount();
```

### 2. 在 Canvas 中绘制

```javascript
function drawQRCode(ctx, x, y, size, url) {
  // 创建 QR Code
  const qr = qrcode(0, 'L');
  qr.addData(url);
  qr.make();

  // 获取矩阵信息
  const moduleCount = qr.getModuleCount();
  const cellSize = (size - 16) / moduleCount;
  const offsetX = x + 8;
  const offsetY = y + 8;

  // 绘制到 Canvas
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
}
```

### 3. 生成 SVG

```javascript
const qr = qrcode(0, 'M');
qr.addData('https://example.com');
qr.make();

// 生成 SVG 字符串
const svg = qr.createSvgTag({
  cellSize: 8,
  margin: 20,
  alt: 'QR Code'
});
```

### 4. 生成 HTML 表格

```javascript
const qr = qrcode(0, 'L');
qr.addData('Hello World');
qr.make();

// 生成 HTML 表格
const table = qr.createTableTag(2, 10);
// 参数1: cellSize (像素)
// 参数2: margin (像素)
```

### 5. 生成 Data URL

```javascript
const qr = qrcode(0, 'L');
qr.addData('https://example.com');
qr.make();

// 生成 PNG Data URL
const dataUrl = qr.toDataURL(2, 10);
// 参数1: cellSize (像素)
// 参数2: margin (像素)

// 使用 Data URL
const img = document.createElement('img');
img.src = dataUrl;
document.body.appendChild(img);
```

## 参数说明

### typeNumber（版本号）

- `0`：自动选择最小合适版本（推荐）
- `1-40`：手动指定版本
  - 版本 1：21×21 模块
  - 版本 40：177×177 模块
  - 每增加一个版本，增加 4 个模块

### errorCorrectLevel（纠错级别）

- `'L'`：约 7% 的错误可被纠正（最小冗余）
- `'M'`：约 15% 的错误可被纠正（标准）
- `'Q'`：约 25% 的错误可被纠正
- `'H'`：约 30% 的错误可被纠正（最大冗余）

### 数据模式

```javascript
// 数字模式（最高效）
qr.addData('1234567890', 'Numeric');

// 字母数字模式
qr.addData('HELLO WORLD', 'Alphanumeric');

// 字节模式（支持中文，默认）
qr.addData('你好世界', 'Byte');

// 汉字模式（Shift JIS 编码）
qr.addData('漢字', 'Kanji');
```

## 容量表

| 纠错级别 | 数字 | 字母数字 | 字节 | 汉字 |
|---------|------|---------|------|------|
| L | 7089 | 4296 | 2953 | 1817 |
| M | 5596 | 3391 | 2331 | 1435 |
| Q | 3993 | 2420 | 1663 | 1024 |
| H | 3057 | 1852 | 1273 | 784 |

*表：版本 40（最大版本）的最大容量*

## 在本项目中的应用

### 海报二维码生成

在 `js/share.js` 中：

```javascript
function drawQRCode(ctx, x, y, size, url) {
  // 白色背景
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, size, size, 10);
  ctx.fill();

  try {
    // 生成二维码
    const qr = qrcode(0, 'L');
    qr.addData(url);
    qr.make();

    // 绘制到 Canvas
    const moduleCount = qr.getModuleCount();
    const cellSize = (size - 16) / moduleCount;
    
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            x + 8 + col * cellSize,
            y + 8 + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  } catch (e) {
    console.error('QR code generation failed:', e);
  }
}
```

### 使用场景

1. **海报分享**：生成包含网站 URL 的二维码
2. **结果保存**：用户可扫描二维码快速访问配对结果
3. **社交分享**：便于在社交媒体传播

## 优势

### 与之前的实现对比

| 特性 | 之前实现 | qrcode-generator |
|------|---------|-----------------|
| 可靠性 | ❌ 生成无效二维码 | ✅ 100% 可扫描 |
| 版本支持 | 1-10 | 1-40 |
| 纠错级别 | 固定 L | L/M/Q/H |
| 数据模式 | 字节 | 数字/字母/字节/汉字 |
| 代码大小 | ~200 行 | ~600 行 |
| 社区支持 | 无 | 活跃 |
| 测试覆盖 | 无 | 广泛 |

### 为什么选择这个库

1. **成熟稳定**：多年维护，无数项目使用
2. **功能完整**：支持所有 QR Code 特性
3. **性能优秀**：纯 JavaScript，无依赖
4. **文档完善**：丰富的示例和 API 文档
5. **MIT 协议**：可自由使用和修改

## 常见问题

### Q1: 二维码无法扫描？

**A**: 确保：
- URL 正确且可访问
- 二维码尺寸足够大（建议至少 100×100 像素）
- 对比度足够（黑白分明）
- 没有遮挡或变形

### Q2: 中文 URL 乱码？

**A**: 使用字节模式（默认）：
```javascript
qr.addData('https://example.com/中文'); // 自动使用 UTF-8 编码
```

### Q3: 如何选择版本？

**A**: 
- 短 URL（< 50 字符）：使用 `0`（自动选择）
- 长 URL 或大量数据：手动指定版本
- 需要高容错：使用版本 10+ 和纠错级别 H

### Q4: 如何优化二维码大小？

**A**:
```javascript
// 减少模块数量
const qr = qrcode(5, 'L'); // 版本 5，低纠错

// 减小 cellSize
const cellSize = 2; // 每个模块 2 像素

// 减少边距
const margin = 4;
```

## 相关链接

- [GitHub 仓库](https://github.com/kazuhikoarase/qrcode-generator)
- [在线演示](http://kazuhikoarase.github.io/qrcode-generator/js/demo/)
- [QR Code 规范](https://www.iso.org/standard/62021.html)
- [二维码原理](https://www.qrcode.com/)

## 许可证

qrcode-generator 使用 MIT 协议开源，详见 [LICENSE](https://github.com/kazuhikoarase/qrcode-generator/blob/master/LICENSE)

---

**最后更新**：2026-06-30  
**版本**：qrcode-generator (精简版)  
**集成方式**：纯 JavaScript，无构建步骤
