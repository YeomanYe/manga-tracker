# Packages 与目录约定

## apps/extension（浏览器扩展，Plasmo）

使用 **Plasmo 0.89+**：单一代码库自动产出 Chrome / Edge / Firefox / Safari 多份 manifest 与 bundle。

```
apps/extension/
├── package.json              # 包含 Plasmo manifest 字段（name / description / permissions / host_permissions）
├── popup.tsx                 # Popup 入口（Plasmo 约定）
├── options.tsx               # Options 全屏页（Plasmo 约定）
├── background.ts             # Service Worker 入口（Plasmo 约定）
├── contents/                 # Content Scripts（Plasmo 约定）
│   └── sync-bar.tsx          # Sync Bar 注入入口（用 Plasmo CSUI 挂载点 + @manga/injector 渲染）
├── src/
│   ├── stores/               # Zustand stores（仅扩展用）
│   ├── lib/                  # 仅扩展用的工具：消息桥（webextension-polyfill）、storage 桥
│   └── ui/                   # 跨入口共享的 React 组件
└── assets/                   # 图标、静态资源
```

### Plasmo 边界约定

- **Plasmo 的 `@plasmohq/storage` / `@plasmohq/messaging` 只在 `apps/extension/src/lib/` 内调用**，不进 `packages/`
- Content script 的 Plasmo 部分只负责"挂载点 + 平台桥"；Sync Bar 的 React 渲染、识别、追踪逻辑全部从 `@manga/injector` 引入
- Plasmo CSUI 的 `getRootContainer` 返回 Shadow DOM root → 交给 `@manga/injector` 的 `createSyncBar`
- 多 target 构建命令：
  - `pnpm dev:extension` → `plasmo dev`（默认 chrome）
  - `pnpm build:extension` → `plasmo build --target=chrome-mv3,firefox-mv2,edge-mv3`

## apps/mobile（Capacitor Android）

```
apps/mobile/
├── capacitor.config.ts
├── src/                      # Vite + React entry，输出 dist/ 给 Capacitor
│   ├── pages/                # 路由页面：bookshelf / detail / reader / settings
│   ├── reader-shell/         # WebView 阅读器外壳逻辑
│   ├── stores/
│   ├── lib/
│   └── ui/
├── android/                  # Capacitor 生成，提交到 git
└── public/
```

约定：
- WebView 注入脚本不要重写一遍，从 `packages/injector` 导入
- pages 一一对应 prep doc 里的屏幕清单

## packages/types

领域类型唯一来源。

```
packages/types/src/
├── manga.ts          # Manga / Author / Tag
├── chapter.ts        # Chapter / ReadingProgress
├── source-rule.ts    # SourceRule / SourceMatcher / SiteAdapter
├── bookshelf.ts      # BookshelfEntry / SortKey / FilterKey
└── index.ts          # 统一 re-export
```

约定：
- 类型 + Zod schema 同文件维护（schema 在下，类型 `z.infer` 出来）
- 不写运行时逻辑，只导出类型和 schema

## packages/source-rules

源规则的 wire format **多源兼容设计**：直接 import 现有开源漫画工具的规则资源，不重复造轮子。

```
packages/source-rules/
├── src/
│   ├── schema.ts                # 内部统一模型（SourceRule + SiteAdapter）的 Zod schema
│   ├── loader.ts                # 入口：detect format → 路由到对应 adapter → 归一化
│   ├── adapters/                # 各 wire format 的转换器
│   │   ├── manga-tracker-v1.ts  # 我们自己的原生格式
│   │   ├── legado-v3.ts         # 阅读 App 漫画书源 import 适配器（中文社区主力）
│   │   └── mihon-port.ts        # Tachiyomi/Mihon 扩展手动 port 后的 JSON 形式（V2）
│   ├── runtime/                 # 选择器执行器：CSS / XPath / regex / @JS
│   └── builtin/                 # 占位规则（仅 example.com）
└── rules-format.md              # 内部 schema + 各 adapter 输入格式说明
```

### Wire Format 判别（loader 入口约定）

所有传入的规则 JSON 必须带 `format` 字段，loader 据此路由到对应 adapter：

```json
{ "format": "manga-tracker-v1", "id": "...", "rules": { ... } }
{ "format": "legado-v3",        "bookSourceUrl": "...", "ruleManga": { ... }, "ruleChapter": { ... } }
{ "format": "mihon-port",       "lang": "zh", "id": 12345, "name": "...", "selectors": { ... } }
```

无 `format` 字段 → 报错，不 fallback 猜测。

### 内部模型（manga-tracker-v1 原生格式）

```json
{
  "format": "manga-tracker-v1",
  "$schema": "https://manga-tracker.example/schema/source-rule-v1.json",
  "id": "site-id-string",
  "name": "站点显示名",
  "version": "1.0.0",
  "matcher": { "domains": ["example.com"] },
  "selectors": {
    "manga": { "title": "h1.title", "cover": "img.cover@src" },
    "chapter": { "list": "ul.chapter-list li a", "number": "regex:第(\\d+)话" },
    "currentUrl": {
      "isMangaPage": "regex:/manga/[a-z0-9-]+$",
      "isChapterPage": "regex:/manga/[a-z0-9-]+/c\\d+"
    }
  }
}
```

### legado-v3 兼容（V1 主力路径）

legado（阅读）的漫画书源 JSON 已有大量中文社区维护的规则。loader 直接 import：

- 用户从 legado 社区拿到 JSON URL（或文件）→ 我们的设置页粘贴 → loader detect `format: "legado-v3"` → adapter 转换 → 内部模型
- 转换映射：`ruleManga.name → selectors.manga.title`，`ruleChapter.chapterList → selectors.chapter.list`，依次类推
- legado 的 `@JS:` 选择器前缀我们 V1 部分支持（沙箱执行），完整支持放 V2

> **零成本起步**：用户首次安装时，可一键导入"社区精选 legado 漫画书源包"（URL 由我们维护一份白名单），瞬间获得几百个源。

### mihon-port（V2 路径）

Tachiyomi/Mihon 的 Kotlin 扩展不能直接跑，但可以：
- 由社区把 Kotlin 选择器手动 port 成 JSON（见 mihon-port adapter）
- 或运行时经 Suwayomi-Server REST 桥接（需要轻后端，V2 才做）

V1 阶段 mihon-port adapter 占位，不实际转换。

### 文件命名 / 版本

- 文件名 `<site-id>.json`
- `id` 全局唯一，使用站点缩写小写
- `version` semver；破坏性变更升 major
- 真实运行规则**不在 git 仓库**——由用户运行时导入或订阅外部 URL

### 合规

- 测试 fixture 必须用 `example.com`，不附"已适配清单"
- legado 兼容代码本身可开源；但默认订阅 URL 不能指向真实盗版源

## packages/injector

content script 抽象，扩展和移动端 WebView 共用。

```
packages/injector/src/
├── detect.ts         # 页面识别：用 SourceRule 匹配当前 URL → 返回作品/章节信息
├── track.ts          # 章节追踪：监听 URL 变化、滚动、阅读时长
├── sync-bar/         # Sync Bar UI（Shadow DOM 隔离）
│   ├── index.ts
│   └── styles.css
└── api.ts            # 暴露给宿主（扩展或 mobile）的统一 API
```

约定：
- Sync Bar 独立 React root，挂到 Shadow DOM，不污染原站样式
- injector 不直接调存储，通过宿主传入的回调（保持平台无关）

## packages/storage-adapter

```
packages/storage-adapter/src/
├── adapter.ts          # 共同接口：BookshelfStore, ProgressStore, SettingsStore
├── indexeddb/          # 扩展用，基于 Dexie
├── sqlite/             # mobile 用，基于 capacitor-community/sqlite
└── index.ts            # 工厂：根据环境返回对应实现
```

约定：
- 接口先定义，再写实现
- 两个实现的方法签名严格一致，不靠 `any` 兼容
- 同一组合约测试跑两端实现（`packages/storage-adapter/tests/contract.test.ts`）

## 跨端代码共享决策

| 问题 | 答 yes → | 答 no → |
|---|---|---|
| Q1: 依赖 `chrome.*` / `browser.*`？ | 留 `apps/extension` | 进 Q2 |
| Q2: 依赖 Capacitor 插件？ | 留 `apps/mobile` | 进 Q3 |
| Q3: 是 UI 组件且只一端用？ | 留 `apps/<x>/src/ui` | **抽到 `packages/*`** |

### 平台分支怎么写

不要在 packages 内部用 `if (isExtension)` 这种运行时分支。改用**依赖注入**：

```ts
// packages/injector/src/api.ts
export function createSyncBar(host: SyncBarHost): SyncBarInstance { ... }

// apps/extension/src/content/index.ts
const host = { onAddBook: (m) => chrome.runtime.sendMessage({ type: 'add', m }) };
createSyncBar(host);

// apps/mobile/src/reader-shell/inject.ts
const host = { onAddBook: (m) => window.bridge.addBook(m) };
createSyncBar(host);
```

反模式：
- `import 'chrome'` 类型进 packages
- 用 `globalThis.chrome` 偷偷判断平台
- 复制粘贴一份代码到两端"先这样"

## 包命名

- `@manga/types` / `@manga/source-rules` / `@manga/injector` / `@manga/storage-adapter`
- 文件 kebab-case，类型 PascalCase，函数/变量 camelCase
- React 组件文件 PascalCase（`SyncBar.tsx`）
