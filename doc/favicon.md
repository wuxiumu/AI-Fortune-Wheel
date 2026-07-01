# Favicon 生成说明

## 概述

本项目提供了 SVG 格式的 favicon（`favicon.svg`），融合了以下主题元素：

- **阴阳符号**：代表东方五行体系
- **星盘元素**：代表西方星座体系
- **五行星**：代表东方哲学
- **主题配色**：金色（#ffd56b）、粉色（#ff5c9d）、紫色（#b57bff）
- **"瓜"字标识**：品牌核心符号

## 设计特点

- 深色背景（银河夜色风格）
- 左右融合的"东西双体系"概念
- 发光效果增强科技感
- 装饰星点增添神秘氛围
- 响应式设计，任何尺寸都清晰

## 使用方法

### 1. 直接使用 SVG（推荐）

现代浏览器都支持 SVG favicon，直接在 HTML 中引用：

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

**优点**：
- 矢量格式，任何尺寸都清晰
- 文件小（约 2KB）
- 支持动画和渐变
- 无需转换

### 2. 转换为 ICO 格式

如果需要兼容旧浏览器，可以转换为 .ico 格式。

#### 方法一：在线转换工具

1. 访问 [SVG to ICO Converter](https://convertio.co/svg-ico/)
2. 上传 `favicon.svg`
3. 选择输出尺寸（建议 16x16, 32x32, 48x48）
4. 下载 `favicon.ico`
5. 放到项目根目录

#### 方法二：使用 ImageMagick（命令行）

```bash
# 安装 ImageMagick
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt install imagemagick

# 转换
convert favicon.svg -resize 16x16 favicon-16.png
convert favicon.svg -resize 32x32 favicon-32.png
convert favicon.svg -resize 48x48 favicon-48.png

# 合并为 ICO
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico

# 清理临时文件
rm favicon-*.png
```

#### 方法三：使用 Node.js 工具

```bash
# 安装工具
npm install -g svg2ico

# 转换
svg2ico favicon.ico favicon.svg
```

#### 方法四：使用 Python

```bash
# 安装依赖
pip install Pillow cairosvg

# 创建转换脚本
python3 << 'EOF'
import cairosvg
from PIL import Image
import io

# 读取 SVG
svg_data = open('favicon.svg', 'rb').read()

# 转换为不同尺寸
sizes = [(16, 16), (32, 32), (48, 48)]
images = []

for size in sizes:
    png_data = cairosvg.svg2png(bytestring=svg_data, output_width=size[0], output_height=size[1])
    img = Image.open(io.BytesIO(png_data))
    images.append(img)

# 保存为 ICO
images[0].save('favicon.ico', format='ICO', append_images=images[1:])
print('✓ favicon.ico 已生成')
EOF
```

### 3. 生成多尺寸 PNG

为不同设备和场景生成多个 PNG 文件：

```bash
# 使用 ImageMagick
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 android-chrome-192x192.png
convert favicon.svg -resize 512x512 android-chrome-512x512.png
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
```

## HTML 引用配置

在 `index.html` 的 `<head>` 中添加：

```html
<!-- 基础 favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- 多尺寸 PNG（兼容性） -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/site.webmanifest">
```

## 创建 Web App Manifest

创建 `site.webmanifest` 文件：

```json
{
  "name": "吃瓜命理盘",
  "short_name": "吃瓜盘",
  "description": "明星CP配对 · 绯闻缘分速测 · 五行/星座双解",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0c0a1d",
  "theme_color": "#ffd56b",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

## Nginx 配置

确保 Nginx 正确提供 favicon 文件：

```nginx
# favicon 缓存策略
location = /favicon.ico {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
    log_not_found off;
}

location = /favicon.svg {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location = /site.webmanifest {
    expires 7d;
    add_header Content-Type "application/manifest+json";
}
```

## 测试

### 浏览器测试

1. 清除浏览器缓存
2. 访问网站
3. 检查标签页图标是否显示

### 在线测试工具

- [Favicon Checker](https://realfavicongenerator.net/favicon_checker)
- [Favicon Validator](https://www.favicongenerator.io/favicon-validator)

## 自定义设计

如需修改 favicon 设计，编辑 `favicon.svg`：

### 修改配色

```svg
<!-- 金色渐变 -->
<linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style="stop-color:#ffd56b"/>
  <stop offset="100%" style="stop-color:#ffb938"/>
</linearGradient>
```

### 修改文字

```svg
<text x="50" y="55" font-family="serif" font-size="16" font-weight="bold"
      fill="url(#gold)" text-anchor="middle">你的文字</text>
```

### 调整元素

使用 SVG 编辑器（如 Inkscape、Figma）打开 `favicon.svg` 进行可视化编辑。

## 文件清单

- `favicon.svg` — 主 favicon（SVG 格式）
- `favicon.ico` — ICO 格式（需生成）
- `favicon-16x16.png` — 16x16 PNG（需生成）
- `favicon-32x32.png` — 32x32 PNG（需生成）
- `apple-touch-icon.png` — Apple 设备图标（需生成）
- `android-chrome-192x192.png` — Android 图标（需生成）
- `android-chrome-512x512.png` — Android 高清图标（需生成）
- `site.webmanifest` — Web App 配置文件（需创建）

## 参考资源

- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon Cheat Sheet](https://mathiasbynens.be/notes/rel-shortcut-icon)
- [SVG Favicons](https://css-tricks.com/svg-favicons/)
- [Web App Manifest](https://web.dev/add-manifest/)

---

**最后更新**：2026-06-30  
**推荐方案**：直接使用 SVG favicon，无需转换
