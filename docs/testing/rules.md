# Testing Rules

## 工具

- **Vitest**（统一所有包）
- React Testing Library（apps 的组件测试，按需）
- Playwright（不强制，等到 reader-shell 复杂度上来再加）

## 写在哪

- 单元测试：与被测文件同目录，`<name>.test.ts`
- Fixtures：`__fixtures__/` 子目录，JSON / HTML 文件
- 集成测试：`packages/<x>/tests/` 或 `apps/<x>/tests/`

## 必须有测试的模块

| 模块 | 覆盖要求 |
|---|---|
| `packages/source-rules` | 每条 schema 字段都要有有效 + 无效用例 |
| `packages/injector/detect` | 页面识别 happy path + URL 变化场景 |
| `packages/storage-adapter` | 两种实现都跑同一组合约测试（共享测试 suite） |

## 不强制

- React 组件细节（V1 阶段优先手测真实环境）
- Background script（手动验证为主）
- Capacitor 原生层（手测 APK）

## 覆盖率底线

- `packages/*` 核心模块：≥ 70% line coverage
- `apps/*`：不强制，但关键流程（书架 CRUD、源切换决策）至少 happy path

## 跨端 hook 怎么测

`packages/injector` 的 hook 必须能在 jsdom 里跑：

- 宿主回调用 `vi.fn()` 注入
- 不依赖真实 `chrome.*` / Capacitor API
- 测试不应启动浏览器（除非用 Playwright 跑 UI）

## 真实漫画站测试

- ❌ **不要在测试里 fetch 真实漫画站**（CI 会被反爬，且违反合规底线）
- ✅ 用 `__fixtures__/<site-id>/<page-snapshot>.html` 静态 HTML 模拟
- ✅ Fixture 文件名脱敏，URL 全部 `example.com`

## 合约测试

`packages/storage-adapter` 的两种实现共用测试套件：

```ts
// packages/storage-adapter/tests/contract.ts
export function runStorageContract(makeStore: () => BookshelfStore) { ... }

// packages/storage-adapter/src/indexeddb/index.test.ts
runStorageContract(() => new IndexedDBBookshelfStore(/* ... */));

// packages/storage-adapter/src/sqlite/index.test.ts
runStorageContract(() => new SQLiteBookshelfStore(/* ... */));
```

任何接口变更必须双侧通过。
