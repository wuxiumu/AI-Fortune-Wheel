# 项目文档索引

本目录包含「吃瓜命理盘」项目的所有技术文档。

## 📚 文档清单

### 部署文档

- **[nginx.md](nginx.md)** — Nginx 部署配置说明
  - 基础配置
  - PHP-FPM 集成
  - SSL/HTTPS 配置
  - 性能优化
  - 安全加固
  - 故障排查

- **[favicon.md](favicon.md)** — Favicon 生成和使用说明
  - SVG favicon 设计说明
  - 转换为 ICO/PNG 格式
  - 多平台适配
  - HTML 引用配置

### 配置文档

- **[config.md](config.md)** — 项目配置说明
  - 全局配置（`js/config.js`）
  - 后端配置（`api/config/config.php`）
  - 环境变量
  - 自定义域名示例

### 规划文档

- **[roadmap.md](roadmap.md)** — 项目改进路线图
  - Phase 1（已完成）
  - Phase 2（已完成）
  - Phase 3（进行中）
  - 功能优先级

## 🚀 快速开始

### 1. 本地开发

```bash
# 启动服务
./start.sh
# 或
php server.php

# 访问
open http://localhost:8000
```

### 2. 生产部署

1. 阅读 [nginx.md](nginx.md) 配置 Nginx
2. 阅读 [config.md](config.md) 修改配置
3. 生成 favicon（参考 [favicon.md](favicon.md)）
4. 部署到服务器

### 3. 自定义配置

编辑 `js/config.js`：

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

## 📊 项目结构

```
51chigua.solutions/
├── doc/                    # 本文档目录
│   ├── README.md          # 本文件
│   ├── nginx.md           # Nginx 配置
│   ├── favicon.md         # Favicon 说明
│   ├── config.md          # 配置说明
│   └── roadmap.md         # 改进路线图
├── index.html             # 主页
├── favicon.svg            # SVG favicon
├── server.php             # PHP 路由入口
├── start.sh               # 启动脚本
├── css/                   # 样式文件
├── js/                    # JavaScript 文件
├── api/                   # PHP 后端
│   ├── index.php
│   ├── config/
│   ├── controllers/
│   ├── models/
│   └── data/              # JSON 数据
├── pages/                 # 子页面
└── tests/                 # 单元测试
```

## 🔧 常用命令

```bash
# 启动服务
npm start
# 或
./start.sh

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 查看文档
cat doc/nginx.md | less
```

## 📝 文档维护

- 每次功能更新后，同步更新相关文档
- 重大变更需要在 `roadmap.md` 中记录
- 配置变更需要在 `config.md` 中说明
- 部署相关变更需要更新 `nginx.md`

## 🤝 贡献指南

欢迎提交文档改进建议！

1. Fork 项目
2. 修改文档
3. 提交 Pull Request
4. 等待审核

## 📮 反馈

如有文档问题或建议，请通过以下方式联系：

- Email: contact@51chigua.solutions
- GitHub Issues: [提交问题](https://github.com/your-repo/issues)

---

**最后更新**：2026-06-30  
**版本**：v1.2.0  
**维护者**：51chigua Team
