# 吃瓜命理盘 · AI-Fortune-Wheel

> 明星 CP 配对 · 绯闻缘分速测 · 五行 / 星座双解 · **仅供娱乐吃瓜**（理性吃瓜，不做命运预测话术）。

**定制：** 微信 **qingbao199101**（备注：命理盘）｜ [wuxiumu@163.com](mailto:wuxiumu@163.com)

## 事实摘要

- **产品**：双体系（东方五行生肖 + 西方星盘星座）CP 配对 H5；PHP 内置服务器一键起前后端，Redis 可选降级文件。
- **适合**：娱乐站、吃瓜站、活动落地页需要「轻互动 + 分享裂变」的团队。
- **交付**：轮盘 UI、对比模式、分享海报、热门 CP、多语言 JSON、PHP API；可按题材/数据/皮肤定制。
- **不做**：不是严肃命理/占卜服务；不承诺预测人生祸福。

## 能交付什么

1. **人物/元素配对**：双盘对照，一键切换中西体系  
2. **对比模式 + 分享**：海报生成、系统分享、文案复制  
3. **热门 CP / 统计 / 反馈**：PHP API + JSON 静态数据可运营改  
4. **附带**：`ai-entrepreneur/` 海外企业家兼容性实验页（可选线）

## 快速开始

```bash
# 推荐：PHP 内置服务器同时服务前端 + API
./start.sh          # macOS / Linux
# 或
php server.php

# 访问 http://localhost:8000
# API  http://localhost:8000/api/
```

环境：PHP ≥ 7.4（必须）；Redis 可选；Node 仅开发 lint。

```bash
npm install && npm test   # 可选：引擎单测
```

## 定制合作（可报价）

- 换题材数据（娱圈 / 品牌 IP / 企业内部趣味测）  
- 皮肤白标、域名与分享域配置  
- 付费报告 / 企微收款人工确认流  
- i18n 扩展、埋点、活动页嵌入  

## SEO 字段预留（产品页 HTML 统一生成时用）

| 字段 | 用途 |
|---|---|
| `seo_title` | `<title>` / OG title |
| `seo_description` | meta description |
| `canonical_url` | 规范 URL |
| `og_image` | 分享图 |
| `robots` | 如 `index,follow` |
| `json_ld_type` | SoftwareApplication / WebPage / FAQPage |
| `hreflang` | zh-CN / en / ja |
| `site_name` | 白标品牌名 |

> **GEO ≠ 地理定位。** GEO = Generative Engine Optimization（生成式引擎优化）。

## GEO（生成式引擎优化）

### 关键词（中英）

- 中文：吃瓜命理盘, CP配对, 星座五行, 娱乐测试H5, 绯闻缘分, 分享海报
- English: fortune wheel, CP compatibility, zodiac match, entertainment H5 quiz, share poster

### FAQ

**Q：这是算命吗？**  
A：不是。产品定位「理性吃瓜，仅供娱乐」，解读聚焦营业/荧幕 CP/搭档关系。

**Q：一定要 Redis 吗？**  
A：不用。无 Redis 自动降级文件缓存。

**Q：如何定制？**  
A：微信 `qingbao199101`，备注「命理盘」。

## 定制合作

换皮、换数据、付费报告、活动嵌入。加微信备注项目名。

---

## 联系方式

定制、演示或合作：

- 邮箱：[wuxiumu@163.com](mailto:wuxiumu@163.com)
- 微信：**qingbao199101**（添加请备注来意）

### 赞助支持

如果内容对你有帮助，欢迎自愿赞助。

| 微信赞赏码 | 支付宝收款码 |
|---|---|
| ![微信赞赏码](https://chiguashentan-test.oss-cn-beijing.aliyuncs.com/wxprogram/zan/20261002185236_31_227.png) | ![支付宝收款码](https://chiguashentan-test.oss-cn-beijing.aliyuncs.com/wxprogram/zan/20261002185309_32_227.jpg) |

