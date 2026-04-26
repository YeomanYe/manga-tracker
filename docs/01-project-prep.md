# 01 — Project Prep Brief

> 第一阶段（6-8 周）的 MVP 范围、主交互、技术栈、Preview 决策。
> 这份是 kickoff 锚点，后续工程规范和设计系统都基于它。

## Product Intent

中文漫画追踪 + 换源工具：用户在已适配的中文漫画站浏览时自动同步阅读进度到本地书架；移动端能从书架跳回任意可用源继续阅读，并支持源站之间手动换源。

## Target Users

- **主要**：中文漫画爱好者，常年在多个第三方漫画站之间跳转，需要统一书架和进度，且不想手动打卡。
- **次要**：bgm.tv / AniList 用户中追漫画为主、嫌手动记进度太烦的子群。
- **现状替代方案**：
  - Mihon（Tachiyomi 分叉）—— 移动端原生阅读器，但 PC 浏览器无追踪
  - MAL-Sync —— 浏览器扩展，但中文站点几乎没覆盖
  - bgm.tv —— 手动打卡，体验过时

## Core Flow

### 扩展端 happy path（PC）

1. 用户在已适配漫画站打开作品页 → content script 自动识别 → 在页面右下注入 **Sync Bar**
2. Sync Bar 显示「+ 加入书架」状态化按钮 → 用户点击 → 写入本地书架，按钮变「✓ 在书架」
3. 用户读章节 → content script 检测章节翻页 → 自动写入进度，浮现 toast「已记录第 X 话」
4. 切到另一部作品继续读 → 同样自动追踪
5. 用户点扩展图标打开 Popup → 浏览跨站书架、最近阅读、跳设置

### 移动端 happy path（Android）

1. 打开 app → 本地书架（按最近阅读排序）
2. 点作品 → 详情页：上次读到第 X 话 + 可用源列表
3. 点「继续阅读」→ WebView 打开源站对应章节
4. 翻页 → 注入脚本继续追踪进度（与扩展共用同一份脚本）
5. 当前源打不开 → 手动换源继续

## Main Interaction Design

### 浏览器扩展

#### Screens

| 屏幕 | 形态 | 内容 |
|---|---|---|
| **Sync Bar**（注入到页面） | 右下浮动小条，默认折叠为图标 | 主操作入口；状态化按钮：识别中 / + 加入书架 / ✓ 已在书架 / 📖 上次第 X 话，继续；章节翻页时浮现 toast |
| **Popup**（360×500） | 工具栏图标弹出 | 跨站书架快速浏览；最近阅读列表（5 条）；跳 Options；底部 Tab：书架 / 最近 / 设置 |
| **Options 全屏页** | `chrome://extensions/options` | 完整书架管理（搜索、按源分组、批量删）；源规则订阅（添加 JSON URL、启用/禁用）；数据导入导出 |

#### Sync Bar 规格

- 默认折叠成一个 32×32 圆形图标，贴在页面右下，不遮挡内容
- 识别到作品后展开为一行（包含状态按钮 + 当前章节信息）
- 章节翻页时浮现 toast「已记录第 X 话」（2 秒淡出）
- 用户可在 Options 调整：位置（左下/右下/左上/右上）、是否默认折叠、是否显示 toast
- 通过 Shadow DOM 隔离样式，不污染原站

#### State transitions

- `识别中` → `已识别（未在书架）`：Sync Bar 显示「+ 加入书架」
- `已识别（未在书架）` → 用户点加入 → `已识别（已在书架）`：按钮变「✓」
- `已识别（已在书架）` + 章节翻页 → `进度更新中` → `已更新`：toast「已记录第 X 话」
- `识别失败`：Sync Bar 显示警告图标 + 提示「检查规则版本 / 上报」

### 移动端 App

#### Screens

| 屏幕 | 内容 |
|---|---|
| **书架**（首页） | 顶部搜索 + 视图切换（网格/列表）；卡片含封面、标题、上次读到、源徽章、未读数；底部 Tab：书架 / 发现（占位）/ 我的 |
| **作品详情** | 封面 + 标题 + 作者 + 简介；章节列表（当前源），上次读到高亮；右上：源切换按钮；底部「继续阅读」醒目 CTA |
| **WebView 阅读器** | 顶部：返回 + 章节标题 + 源标识；主体：源站章节页（注入广告屏蔽 + 移动 CSS 适配 + 追踪脚本）；底部浮动：上/下一章 / 章节列表 |
| **设置** | 源规则订阅（同扩展端）/ 数据导入导出（与扩展互通 JSON）/ WebView 行为（广告屏蔽、UA） |
| **添加作品**（手动） | 粘贴源站 URL → 用规则解析 → 预览作品信息 → 加入书架 |

#### State transitions

- 书架空 → 引导「装扩展开始追踪」或「手动添加 URL」
- 详情加载：loading / error / empty 三态显式
- 「继续阅读」决策：当前源可用 → 直跳；否则提示换源
- WebView 加载失败 → 提示换源或重试

## MVP Scope

### In scope（第一阶段必做）

- 扩展：识别 + 追踪 + Sync Bar + Popup（书架/最近/设置）+ Options（书架管理 + 源订阅）
- App：本地书架 + 详情页 + WebView 阅读器（含注入）+ 源切换 + 设置
- 共享 packages：源规则 JSON schema、注入脚本接口、TS 类型、存储适配层
- 适配 **3-5 个中文漫画站**（首批待定，候选：动漫之家 / 漫画柜 / 拷贝漫画 / 看漫画 / 哔咔）
- 本地存储：扩展 IndexedDB（Dexie），app SQLite（Capacitor 插件）
- 扩展 ↔ app 互通的 JSON 手动导入导出

### Out of scope（推迟到第二阶段）

- 跨设备云同步、用户登录、Web 追踪平台
- 社交（评论 / 关注 / 活动流）、推荐 / 榜单
- iOS app、Play Store 上架
- 实时双向同步

### Non-goals（明确不做）

- 不做内置原生阅读器（始终 WebView，不解析章节图片）
- 不分发任何漫画内容
- 不预置盗版源 URL（规则全靠用户导入/订阅第三方仓库）
- 不在自己服务器做爬虫（所有抓取发生在用户的浏览器/手机里）

## Primary Tech Stack

### Monorepo

- pnpm workspaces + Turborepo
- TypeScript 5.x
- Biome（替代 ESLint + Prettier）

### 浏览器扩展（`apps/extension`）

- **Plasmo 0.89+** —— 多浏览器扩展框架，自动产出 Chrome / Edge / Firefox / Safari 多份 manifest，CSUI 内建支持 Sync Bar 注入
- React 18 + Tailwind CSS 4.x
- Plasmo CSUI 仅作"挂载点"，UI 渲染逻辑仍由 `@manga/injector` 提供（保持注入逻辑跨端复用）
- Plasmo Storage / Messaging API **仅在 `apps/extension` 内部使用**，不污染 `packages/*`
- Dexie.js（IndexedDB，作为 storage-adapter 的扩展端实现）
- Zustand（状态管理）

### 移动端 App（`apps/mobile`）

- **Capacitor 6.x**（推荐：React 代码与扩展共享率最高）
- React 18 + Vite 5（同栈）
- Tailwind CSS 4.x
- `@capacitor-community/sqlite`（带加密支持）
- Zustand（store 代码部分跨端复用）
- Capacitor Browser 插件 / 自定义 WebView 包装（注入 content script）

### 共享 packages

- `packages/source-rules`：源规则 Zod schema + 加载器，**支持多种 wire format 互通**（legado-v3 / mihon-port / manga-tracker-v1），全部归一化到内部模型
- `packages/injector`：content script 接口（识别 + 追踪 hook 抽象，扩展和 app 共用）
- `packages/types`：领域类型（Manga / Chapter / ReadingProgress / SourceRule）
- `packages/storage-adapter`：存储抽象层（IndexedDB / SQLite 同接口）

### 源规则生态策略（关键）

不重复造轮子。借鉴现有开源漫画工具的成熟资源：

| 项目 | 形态 | 中文站覆盖 | 我们的策略 |
|---|---|---|---|
| **legado（阅读）漫画书源** | JSON + 内嵌 JS | **极强**，中文社区主力 | **wire format 兼容**，loader 直接 import |
| **Tachiyomi / Mihon** | Kotlin extension（JVM） | 强但偏英日 | 内部模型抄它的 manga-native 接口设计；运行级集成放 V2（经 Suwayomi-Server 桥接） |
| **MAL-Sync ChibiScript** | JSON 操作链 | 弱 | 仅参考"规则可热更新"思路 |

V1 默认行为：**用户从 legado 社区导入已有的漫画书源 URL** → 我们的 loader 自动转换 → 写入本地。这样 day 1 就有几百个源可用，不必自己写。

### 构建 / 工具

- Vitest（单测）
- Capacitor build → Android Studio → debug APK

## Preview Decision

- **Status: Required**（已修订）
- **Why**：
  虽然扩展和 app 的 UI 都是 React + Vite，`vite dev` 能跑，但本项目有几个特殊性使独立 preview 站有价值：
  - 扩展 Sync Bar **嵌在第三方漫画站页面**里——`vite dev` 单独打开看不到"被注入到原站"的真实视觉，需要独立壳模拟"原站背景 + 注入 Sync Bar"
  - 移动端 app 在 Capacitor 内 vs 浏览器内的视觉差异（safe-area、滚动行为）需要分别走查
  - **多状态 mock**（空 / loading / error / 不同规模书架）在真实环境里很难凑齐
  - 项目还涉及"扩展端 + 移动端 + Options 页"三类宿主，独立 preview 站可以一屏看齐对比
- **Surface**：`preview/`（项目根目录，与 `apps/` / `packages/` 平级）—— **研发期 UI 调试工具**：Vite + React app，消费 `packages/ui-kit/` 中的真实组件。研发期主要用 `pnpm preview` 跑 dev server 在本地用；可选构建到 `/preview` 子路径供远程评审
- **Functional coverage**：
  - Sync Bar 在"模拟漫画站"背景下的折叠 / 展开 / 已在书架 / 进度更新 toast 四态
  - Popup 360×500 三 Tab（当前 / 书架 / 最近）
  - Options 全屏页（书架管理 + 源订阅）
  - 移动端：书架 / 详情 / 阅读器外壳 / 设置 四屏并排
- **Data strategy**：硬编码 12-15 个虚构作品（覆盖长标题、不同进度、缺失封面、完结 / 连载、多个虚构源标识——全部 example.com，不指向真实漫画站）；状态切换用 URL query (`?state=empty|loading|error`) 或顶部 toolbar 控件
- **Layout & pagination plan**：单页纵向滚动，按"surface"分块（Sync Bar 块 → Popup 块 → Options 块 → 移动端块），每块标注"对应文档章节"
- **Mock data richness**：
  - 12+ 部作品，覆盖长 / 短标题、CJK 全角、英文夹杂、副标题、特殊字符
  - 进度分布：刚开始（ch.1）/ 中段（ch.50+）/ 接近完结 / 已完结
  - 至少 4 个虚构源标识 ID，分布不均匀（验证排序与分组）
  - 时间戳分布：今天 / 昨天 / 上周 / 上月 / 去年（验证"最近阅读"排序）
- **State controller**：顶部 toolbar 固定按钮组：`Normal | Empty | Loading | Error` + `Dark | Light`；URL query 同步保存
- **Validation sequence**：
  1. **第一阶段**：开 preview 站做 UI 走查，验证布局密度、状态切换、暗色对比度
  2. **第二阶段**：扩展 unpacked load → 在目标漫画站测试识别和追踪（真实环境）
  3. **第三阶段**：构建 debug APK → 装自己手机 → 跑完整流程（真实环境）

> 选定 UI 候选 **B · Inkmono** 作为 v1 默认（暗色为主调 + 漫画印刷质感，识别度强、暗色长读舒适、社交分享性最高）。视觉语言已落地到 `packages/ui-kit/src/tokens/inkmono.css`。A / C 仅在设计文档里以候选保留，未来如果重新做品牌升级时再启用。

## Open Decisions

1. **首批适配站点清单（3-5 个）**：候选 动漫之家 / 漫画柜 / 拷贝漫画 / 看漫画 / 哔咔。每个站反爬/CDN/章节结构难度不同，需评估优先级。
2. **Capacitor vs RN 终选**：本简报推荐 Capacitor（代码共享率最高、单人维护成本最低），RN 性能略好但跨端共享差。
3. **Zustand vs Jotai**：建议 Zustand（更主流、API 更简单）。
4. **导入导出格式**：JSON 是否够（人可读、便于 git 备份）？还是要二进制压缩？
5. **同 WiFi 局域网双端互通**：第一阶段建议不做，等云同步前可以考虑。
6. **首批源规则来源（已修订）**：直接 import legado（阅读）社区已有的中文漫画书源 → loader 转换为内部模型。原"自己写 5 个"路径降级为兜底（针对 legado 没覆盖的站点）。开发量从 5 周缩到 1-2 周。
7. **扩展打包工具**：Plasmo（多浏览器，CSUI 内建）vs CRXJS（Chrome MV3 为主，更轻）。当前选 Plasmo，因为 Firefox / Safari 是潜在收益。

## Post-MVP Roadmap（第二阶段及之后）

| 项目 | 触发时机 | 说明 |
|---|---|---|
| Web 追踪平台 | 第一阶段验证完成、用户量 > 1000 | 详情页 + 评论 + 推荐 + 公开书架页（SEO 入口）|
| 云端同步后端 | Web 平台上线后立即跟上 | Supabase 起步，自建可后期切 |
| iOS sideload | Android 验证后 1-2 月 | TestFlight / AltStore 分发 |
| 社交 / 评论 / 榜单 | 用户量 > 5000 | Web 端为主入口 |
| 商业化（订阅） | 用户量 > 10000 | 云同步、统计、自定义主题作为付费墙 |
| 局域网同步 | 用户反馈强烈时 | 云同步上线后可能不再需要 |
| Mihon Kotlin 扩展集成 | legado 覆盖不足 + 用户多语言需求 | 内置 Suwayomi-Server 桥接（需要轻后端），扩展 mihon-port format 支持 |
| 多人共享书架 / 推荐流 | 社交功能稳定后 | 形成社区飞轮 |
| 正版源对接（哔哩哔哩漫画 / 快看 / 腾讯动漫） | 商业化前 | 转向"半合规阅读器"定位，铺平上架可能性 |
| B 端：创作者后台 / 数据榜单 / CPS | 用户量 > 50000 | 真正的盈利天花板路径 |

**规模预期**：
- MVP（6-8 周）：自用 + 朋友试用，几十人量级
- 6 个月：1000 用户（早期种子）
- 12 个月：1 万用户（订阅可启动）
- 24 个月：10 万用户（B 端可启动）
- 天花板：参考动漫之家盛期，约 200 万 DAU
