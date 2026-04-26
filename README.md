# manga-tracker

中文漫画追踪 + 换源工具。Indie / 个人项目。

## 形态

- **浏览器扩展**（PC，Plasmo 多浏览器：Chrome / Edge / Firefox / Safari）：在中文漫画站浏览时自动识别作品和章节，写入本地书架；通过注入到页面的 Sync Bar 提供主操作入口。
- **移动端 App**（Android 优先，Capacitor + WebView 套壳）：本地书架 + 点击作品跳转源站继续读 + 跨源切换。

两端共享一份「源站适配规则」（JSON），且都从 `@manga/ui-kit` 导入同一份 React 组件。

## 第一阶段范围（6-8 周）

- 扩展 + Android app 跑通端到端：识别 → 追踪 → 书架 → 跳读 → 换源
- 数据全部本地存储（IndexedDB / SQLite），不接云端
- 适配 3-5 个中文漫画站
- 不预置任何盗版源 URL，规则全靠用户导入或订阅第三方
- 视觉语言：**Inkmono · Candidate B**（暗色 + 漫画印刷质感）

第二阶段（不在本期范围）：Web 追踪平台、云端同步、iOS、社交、Mihon 桥接。

## 技术栈

- pnpm + Turborepo + TypeScript 5 + Biome
- **扩展（Plasmo 0.89+）**：跨浏览器 manifest + React 18 + Dexie.js
- **移动端（Capacitor 6 + Android）**：React 18 + Vite + capacitor-community/sqlite
- **UI 共享层（@manga/ui-kit）**：React 18 + plain CSS tokens（Inkmono），三端共享，零漂移
- **Preview（preview/，研发期调试工具）**：Vite 5 + React 18，import @manga/ui-kit 真实组件
- **源规则兼容**：legado 漫画书源（V1 主力）+ 自有 v1 格式 + mihon-port（V2）
- 共享：MobX、Zod

详见 [`docs/01-project-prep.md`](./docs/01-project-prep.md)。

## 目录

```
manga-tracker/
├── apps/
│   ├── extension/              # 浏览器扩展（Plasmo · TBD）
│   └── mobile/                 # Android app（Capacitor · TBD）
├── packages/
│   ├── ui-kit/                 # 共享 React 组件 + Inkmono 视觉语言
│   ├── types/                  # 领域类型 + Zod schema (TBD)
│   ├── source-rules/           # 源站规则 schema + loader (TBD)
│   ├── injector/               # content script 抽象 (TBD)
│   └── storage-adapter/        # 本地存储抽象 (TBD)
├── preview/                    # 研发期 UI 调试工具（Vite + React）
│                               #   import @manga/ui-kit 的真实组件
│                               #   带状态/主题/聚焦切换控件
├── docs/                       # 工程规范
├── site/                       # 静态设计文档
├── scripts/
│   └── build-dist.mjs          # 合并 site/ + preview/dist 到 dist/
├── wrangler.toml               # Cloudflare Pages 配置
├── package.json                # workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── biome.json
```

## 开发命令

```bash
pnpm install                # 首次安装

pnpm preview                # Preview dev server (http://localhost:5174) — 研发期主用
pnpm preview:build          # 构建 preview
pnpm build:site             # 构建 preview + 合并到 dist/（CF Pages 用）

pnpm check                  # Biome lint + format 检查
pnpm check:fix              # 自动修复
```

## Preview（研发期 UI 调试工具）

`preview/` 是开发期的 React playground。直接 import `@manga/ui-kit` 的真实组件——你改一个组件，extension / mobile / preview 三端同时刷新。

**使用场景**：
- 开新组件时先在 preview 里验证视觉和交互（不必先跑扩展或装 APK）
- 调试边界情况：长标题、空数据、加载错误、不同主题
- 远程评审：发链接给朋友看进度
- 截图沟通：状态切换全靠 URL，截图能定位到具体场景

**操作**：
- 顶部 toolbar：`Focus`（聚焦单组件 / 全部）、`State`（normal/empty/loading/error）、`Theme`（dark/light）
- URL query 全程同步：`?focus=sync-bar&state=empty` 直达
- localStorage 记住主题选择

```bash
pnpm preview     # → http://localhost:5174
```

## 设计文档站

- 本地：`python3 -m http.server 8000 -d site` → http://localhost:8000
- 线上：你的 Cloudflare Pages 项目地址（在 CF dashboard 看，通常是 `<project>.pages.dev`）

## 部署（Cloudflare Pages）

1. 推到 GitHub：`git push -u origin main`
2. Cloudflare Pages 控制台 → Connect to Git → 选 `YeomanYe/manga-tracker`
3. 构建配置：
   - Build command: `pnpm install --frozen-lockfile=false && pnpm build:site`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION=20`
4. push 到 `main` 自动部署，PR 自动出 preview

详见 `site/index.html` 的部署章节。

## 开发约束

- 一个人开发，目标 6-8 周内能装在自己手机上跑
- 不上 App Store / Play Store，sideload APK 分发
- 服务器（如有）放海外，规避国内备案
