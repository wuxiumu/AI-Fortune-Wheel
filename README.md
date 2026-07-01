# 吃瓜命理盘 · 51chigua.solutions

> 明星 CP 配对 · 绯闻缘分速测 · 五行 / 星座双解 · 仅供娱乐吃瓜

## 简介

「吃瓜命理盘」是一款双体系 CP 配对小工具，把东方五行生肖和西方星盘星座放在同一张盘上，让用户一键切换、双体系对照，产生「两边都这么说」的双重盖章感。

产品定位：**理性吃瓜，仅供娱乐**。彻底规避人生祸福、命运预测等传统命理话术，所有解读聚焦娱乐圈营业、荧幕 CP、绯闻舆论与搭档关系。

**当前版本**：v1.2.0（Phase 2 完成）

## 目录结构

```
51chigua.solutions/
├── index.html              # 主页（双体系轮盘 + 对比模式 + 分享）
├── README.md
├── package.json            # Node 工具（ESLint / Prettier）
├── .eslintrc.json
├── .prettierrc
├── .editorconfig
├── .gitignore
├── css/
│   ├── style.css           # 样式入口
│   ├── variables.css       # 主题变量
│   ├── base.css            # 基础重置
│   ├── layout.css          # 布局（header / stage / footer）
│   └── components.css      # 组件（picker / wheel / result / compare / share）
├── js/
│   ├── data.js             # 命理数据常量
│   ├── engine.js           # 评分引擎（纯函数，易测试）
│   ├── wheel.js            # SVG 轮盘绘制（支持盘面点击选择）
│   ├── share.js            # 海报生成 / 系统分享 / 文案复制
│   ├── api.js              # 后端 API 调用封装
│   └── main.js             # 交互入口（动效 / 对比模式）
├── pages/
│   ├── about.html          # 关于我们
│   ├── disclaimer.html     # 免责声明 / 隐私政策
│   ├── faq.html            # 常见问题
│   └── contact.html        # 联系我们
├── api/                    # PHP 后端（Redis + 文件降级）
│   ├── index.php           # 路由入口
│   ├── .htaccess           # Apache 重写
│   ├── config/
│   │   ├── config.php      # 全局配置（Redis / 路径 / 限流）
│   │   └── routes.php      # 路由表
│   ├── controllers/        # 控制器（Result / Hot / Stats / Share / I18n / Feedback）
│   ├── models/             # 数据模型（Result / Redis / File）
│   ├── utils/              # 工具类（Response）
│   ├── data/               # 静态数据（JSON 配置，便于运营修改）
│   │   ├── east.json       # 十二地支
│   │   ├── west.json       # 十二星座
│   │   ├── elements_east.json
│   │   ├── elements_west.json
│   │   ├── cross.json      # 元素互译
│   │   ├── blurb.json      # 评语库
│   │   ├── hot_cp.json     # 预置热门 CP
│   │   └── i18n/           # 多语言（zh / en / ja）
│   └── cache/              # Redis 降级时的文件缓存
├── doc/
│   └── roadmap.md          # 改进路线图
└── assets/                 # 静态资源（预留）
```

## 快速开始

只需一个命令，PHP 内置服务器同时服务前端 + 后端：

```bash
# 方式一：启动脚本（推荐，自动检测环境）
./start.sh              # macOS / Linux
start.bat               # Windows

# 方式二：直接 PHP
php server.php

# 方式三：自定义端口
APP_PORT=8080 php server.php
```

启动后访问：
- 主页：http://localhost:8000
- API： http://localhost:8000/api/
- 友好路由：http://localhost:8000/about、/faq、/contact

> 不需要 Node、不需要 Nginx、不需要 Redis（没有 Redis 自动降级到文件存储）。

### 环境要求

- **PHP 7.4+**（必须）
- **Redis**（可选，未安装自动降级到文件存储）
- **Node.js**（可选，仅开发时用 ESLint / Prettier）

### 开发工具（可选）

```bash
npm install          # 安装 ESLint / Prettier
npm run lint         # 代码检查
npm run lint:fix     # 自动修复
npm run format       # 格式化
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET  | `/api/` | 健康检查 |
| POST | `/api/calc` | 计算配对结果 |
| GET  | `/api/hot?count=10&system=east` | 热门 CP |
| POST | `/api/hot/incr` | 增加热度 |
| GET  | `/api/stats` | 全站统计 |
| GET  | `/api/i18n/:lang` | 多语言文案 |
| POST | `/api/share` | 保存分享 |
| GET  | `/api/share/:id` | 获取分享 |
| GET  | `/api/history/:id` | 历史记录 |
| POST | `/api/feedback` | 提交反馈 |

## 核心功能

- **双体系互译**：同一对 CP 能用五行解也能用星座解，对比模式并排展示
- **盘面交互**：直接点击盘面扇区选择生肖/星座（不只面板）
- **转盘动画**：点击"开转"时盘面旋转 3-5 圈
- **海报分享**：Canvas 手绘海报，一键下载或系统分享
- **文案复制**：一键复制吃瓜文案到剪贴板
- **热门 CP**：Redis 有序集合驱动的实时排行榜
- **多语言**：中/英/日三语切换框架
- **数据 JSON 化**：评语库、热门 CP、文案全部配置文件化
- **Redis + 文件降级**：Redis 不可用时自动降级到文件缓存

## 配置

详见 [`doc/config.md`](doc/config.md)。

快速配置示例（`js/config.js`）：

```js
const SITE_CONFIG = {
  domain: 'your-domain.com',
  baseUrl: 'https://your-domain.com',
  siteName: '你的站点名',
  tdk: {
    title: '站点标题',
    description: '站点描述',
    keywords: '关键词1,关键词2'
  }
};
```

## 改进路线图

详见 [`doc/roadmap.md`](doc/roadmap.md)。

## 许可

© 2026 51chigua.solutions · 仅供娱乐，请勿当真
