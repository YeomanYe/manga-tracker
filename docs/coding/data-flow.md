# 数据流

## 三层

```
UI 组件
   │  read/write
   ▼
MobX store（内存状态）
   │  persist
   ▼
@manga/storage-adapter
   │  IndexedDB / SQLite
   ▼
本地存储
```

## Store 划分

| Store | 职责 | 持久化字段 |
|---|---|---|
| `useBookshelfStore` | 书架列表、当前选中、最近阅读队列 | 全部 |
| `useSourceStore` | 已加载源规则、订阅 URL、启用/禁用 | 订阅 URL + 启用状态 |
| `useSettingsStore` | Sync Bar 位置、广告屏蔽、UA 等偏好 | 全部 |

每个 store 一个文件，放 `apps/<x>/src/stores/`。**不允许写跨 store 业务逻辑**（要跨就抽 service 函数）。

## 持久化策略

- 所有跨会话数据走 storage-adapter，不放 `localStorage`
- store 启动时调 `hydrate()`：从 storage 读初值
- store 写入操作必须双写：内存 + storage（封装到 store action 内）
- React 组件**不直接调** storage-adapter

## 异步加载

详情页加载源站元数据需要显式四态：

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
  | { status: 'empty' };
```

- 用 React Suspense + ErrorBoundary 处理 loading / error
- 空态必须显式判断（不要靠 `data?.length === 0` 的隐式默认）

## 跨入口通信（扩展）

- popup ↔ background：`chrome.runtime.sendMessage`
- content ↔ background：同上
- background 是**唯一可写存储的角色**（避免并发冲突）
- 消息格式集中在 `apps/extension/src/lib/messages.ts`，用 discriminated union 类型化：
  ```ts
  type Message =
    | { type: 'add-book'; manga: Manga }
    | { type: 'update-progress'; bookId: string; chapter: number };
  ```

## 跨入口通信（mobile）

- 单进程，不需要消息传递
- WebView 内的 injector 通过 `window.bridge.*` 调宿主（Capacitor plugin 暴露）
- bridge 接口定义在 `apps/mobile/src/lib/bridge.ts`，类型化
