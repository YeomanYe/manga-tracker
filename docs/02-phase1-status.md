# 02 — Phase 1 实现状态

> 这份文档跟踪第一阶段（6-8 周）的实际完成度。每个模块标 ✅ 完成 / 🟡 骨架 / 🔴 待真实环境验证。

## 共享 packages

| 包 | 状态 | 说明 |
|---|---|---|
| `@manga/types` | ✅ | 完整类型 + Zod schema：Manga / Chapter / ReadingProgress / SourceRule / BookshelfEntry / Settings |
| `@manga/source-rules` | ✅ | loader 多 format 路由 / CSS+regex selector runtime / manga-tracker-v1 + legado-v3 adapter；mihon-port 占位 |
| `@manga/storage-adapter` | ✅ / 🔴 | IndexedDB（Dexie，扩展端可用）；SQLite 是内存 stub，**真机上需要换成 `@capacitor-community/sqlite` 调用** |
| `@manga/stores` | ✅ | MobX 6 object 模式（makeObservable + annotations，无装饰器）：BookshelfStore / SourceStore / SettingsStore / RootStore + StoreProvider |
| `@manga/injector` | ✅ | detect / track URL changes / Sync Bar 在 Shadow DOM 内挂载 |
| `@manga/ui-kit` | ✅ | Inkmono 视觉 + 全部 SyncBar/Popup/Options/Mobile 组件 |

## apps/extension（Plasmo）

| 模块 | 状态 | 说明 |
|---|---|---|
| 项目脚手架 | ✅ | Plasmo 0.90，`plasmo build` 通过，产出 chrome-mv3 manifest + 4 个 entry |
| popup.tsx | ✅ | 接 MobX store，渲染 PopupShell（书架 / 最近） |
| options.tsx | ✅ | 接 MobX store，渲染 OptionsPage（书架 + 源订阅） |
| background.ts | ✅ | 占位 SW，接消息但不路由（V2 处理跨 surface 写入并发） |
| contents/sync-bar.tsx | ✅ | 接 store + injector + ui-kit CSS（`data-text:` 注入到 Shadow DOM） |
| 真实漫画站测试 | 🔴 | **必须在用户浏览器装 unpacked 跑** |

**已知 V1 限制**：popup / options / content 各自独立 IndexedDB 连接（V1 简化），cross-surface 实时同步留给 V2 用 messaging 实现。

## apps/mobile（Capacitor + React）

| 模块 | 状态 | 说明 |
|---|---|---|
| 项目脚手架 | ✅ | Vite + React + Capacitor 配置完成，`pnpm mobile:build` 通过 |
| 路由 | ✅ | react-router-dom：`/` / `/manga/:id` / `/read/:id/:chapter` / `/settings` |
| pages | 🟡 | 书架页接了真实 store；详情/阅读器/设置先用 mock，TODO 接 selected manga |
| WebView 阅读器 | 🔴 | UI 外壳完成；**真实 Capacitor InAppBrowser + 注入脚本未接** |
| SQLite 持久化 | 🔴 | 接口完成，CapacitorSQLiteAdapter 是内存 stub，**真机上需切到真 SQLite** |
| Android 工程 | 🔴 | `capacitor add android` 还没跑过；首次需要 `pnpm sync:android` 后用 Android Studio 打开 |

## 功能闭环（端到端）

| 流程 | 扩展 | 移动端 |
|---|---|---|
| 识别作品 / 章节 | ✅ 真实 DOM 解析 | n/a（用扩展同步过来）|
| 写入本地书架 | ✅ IndexedDB | 🔴 内存 stub，需换真 SQLite |
| 显示书架 | ✅ 接 MobX store | ✅ 接 MobX store（同份） |
| 跳源站继续读 | n/a | 🔴 WebView wrapper 待接 |
| 换源 | 🟡 数据模型支持 `alternateSources`，UI 未做 | 同 |
| 导入 legado 源 | ✅ adapter 支持 CSS-only legado-v3 | 同（共用 source-rules）|
| 导入 / 导出 JSON | 🟡 store 有 `importPack`，UI button 未接 | 同 |

## 真实环境验证清单（用户端必做）

阶段一（扩展）：
1. `pnpm ext:build` → 把 `apps/extension/build/chrome-mv3-prod/` 作为 unpacked 装到 Chrome
2. 写一份 `manga-tracker-v1` 格式的 SourceRule JSON，用 Options 页粘贴导入（V1 还没做粘贴 UI，需要直接调 `store.sources.importRule`）
3. 在那个站打开作品页，看 Sync Bar 能否注入 + 识别
4. 翻章节，看进度能否被记录

阶段二（移动端）：
1. `pnpm mobile:build` 然后 `pnpm sync:android`（首次 Capacitor 会让你 `cap add android`）
2. Android Studio 打开 `apps/mobile/android/`，连真机或模拟器
3. 从扩展 export JSON，在 app 里 import（V1 同样未做 UI，需要在控制台调 store action）
4. 点书架作品 → 看 WebView shell 能否打开 source URL

## 第二阶段路线图

按 prep doc 的 Post-MVP Roadmap 走：Web 追踪平台 → 云同步 → iOS → Mihon 桥接 → 商业化。

## 下一步建议（按价值排序）

1. **写 1 个真实站点的 manga-tracker-v1 规则**（自己常看的一个站），跑通端到端。比 mock 更能暴露 selector runtime 的真实 bug。
2. **替换 mobile SQLite stub 为真 Capacitor 实现** —— 否则 app 关掉数据就丢。
3. **WebView 阅读器接 Capacitor Browser 插件**，把 onUrlChanged 上报回 store，实现移动端的进度追踪。
4. **Options / Settings 页加 import/export 按钮**，把 store 的能力暴露给用户。
5. **跨 surface messaging**：背景 SW 收口写入，popup/options/content 通过消息读 → 解决并发。
