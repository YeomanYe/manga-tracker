# Packages 与目录约定

## apps/extension（浏览器扩展，MV3）

```
apps/extension/
├── manifest.config.ts        # CRXJS manifest 定义
├── src/
│   ├── popup/                # Popup React app（书架 / 最近 / 设置入口）
│   ├── options/              # Options 全屏页（书架管理 + 源订阅）
│   ├── content/              # Content script：注入 Sync Bar，调用 packages/injector
│   ├── background/           # Service worker：消息路由、存储写入
│   ├── stores/               # Zustand stores（仅扩展用）
│   ├── lib/                  # 仅扩展用的工具
│   └── ui/                   # 仅扩展用、跨入口共享的组件
└── public/                   # 图标、静态资源
```

约定：
- popup / options / content / background 每个入口各自维护组件树
- 跨入口共享的组件放 `src/ui/`
- 业务逻辑只许从 `packages/*` 引入

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

```
packages/source-rules/
├── src/
│   ├── schema.ts             # Zod schema 定义 SourceRule
│   ├── loader.ts             # 加载、校验、版本比对、订阅
│   └── builtin/              # 内置 fallback 规则（仅 example.com 占位）
└── rules-format.md           # JSON 格式说明（贴给社区贡献者）
```

### SourceRule JSON v1（最小骨架）

```json
{
  "$schema": "https://manga-tracker.example/schema/source-rule-v1.json",
  "id": "site-id-string",
  "name": "站点名称",
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

约定：
- 文件名 `<site-id>.json`
- `id` 全局唯一，使用站点缩写小写
- `version` semver；破坏性变更升 major
- 真实运行规则**不在 git 仓库**

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
