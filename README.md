# manga-tracker

中文漫画追踪 + 换源工具。Indie / 个人项目。

## 形态

- **浏览器扩展**（PC，Chrome/Firefox MV3）：在中文漫画站浏览时自动识别作品和章节，写入本地书架；通过注入到页面的 Sync Bar 提供主操作入口。
- **移动端 App**（Android 优先，Capacitor + WebView 套壳）：本地书架 + 点击作品跳转源站继续读 + 跨源切换。

两端共享一份「源站适配规则」（JSON），都属同一 monorepo。

## 第一阶段范围（6-8 周）

- 扩展 + Android app 跑通端到端：识别 → 追踪 → 书架 → 跳读 → 换源
- 数据全部本地存储（IndexedDB / SQLite），不接云端
- 适配 3-5 个中文漫画站
- 不预置任何盗版源 URL，规则全靠用户导入或订阅第三方

第二阶段（不在本期范围）：Web 追踪平台、云端同步、iOS、社交。

## 技术栈

- pnpm + Turborepo + TypeScript + Biome
- **扩展（Plasmo 0.89+）**：跨浏览器 manifest（Chrome / Edge / Firefox / Safari）+ React 18 + Tailwind v4 + Dexie.js
- **移动端（Capacitor 6 + Android）**：React 18 + Vite + capacitor-community/sqlite
- **源规则兼容**：legado 漫画书源（V1 主力，复用中文社区资源）+ 自有 v1 格式 + Mihon port（V2）
- 共享：Zustand、Zod

详见 `docs/01-project-prep.md`。

## 目录

```
manga-tracker/
├── apps/
│   ├── extension/          # 浏览器扩展 (MV3)
│   └── mobile/             # Android app (Capacitor)
├── packages/
│   ├── source-rules/       # 源站规则 schema + 加载器
│   ├── injector/           # content script 接口（扩展和 app 共用）
│   ├── types/              # 领域类型
│   └── storage-adapter/    # 本地存储抽象层
├── docs/                   # 工程规范（已落地）
│   ├── 01-project-prep.md
│   ├── architecture/
│   ├── coding/
│   ├── ui/
│   ├── testing/
│   └── ai-guide/
└── site/                   # 设计文档站（部署到 Cloudflare Pages）
    ├── index.html          # 主设计文档
    ├── preview/
    │   └── index.html      # UI Preview（Tooling Mono 默认风格）
    ├── _headers
    └── wrangler.toml
```

## 设计文档

完整设计文档（流程 / 架构 / 模块 / UI 候选 / ASCII 线框 / 部署）：

- 本地：`cd site && python3 -m http.server 8000` → http://localhost:8000
- 在线（部署后）：https://manga-tracker.pages.dev

## Preview 站（UI 走查）

用 **Tooling Mono**（v1 默认风格）实现的 UI 预览，覆盖 Sync Bar / Popup / Options / 移动端 4 类宿主，带状态切换（normal / empty / loading / error）：

- 本地：上面命令启动后访问 http://localhost:8000/preview/
- 在线：https://manga-tracker.pages.dev/preview/
- URL query：`?state=empty` 等可直接定位到状态

## 部署

设计文档站通过 **Cloudflare Pages** 自动部署：

1. 推到 GitHub：`git push -u origin main`
2. Cloudflare Pages 控制台 → Connect to Git → 选 `YeomanYe/manga-tracker`
3. Build output directory: `site`，其余留空
4. Push to `main` 自动部署，PR 自动出 preview

详见 `site/index.html` 的部署章节。

## 开发约束

- 一个人开发，目标 6-8 周内能装在自己手机上跑
- 不上 App Store / Play Store，sideload APK 分发
- 服务器（如有）放海外，规避国内备案
