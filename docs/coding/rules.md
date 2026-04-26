# Coding Rules（总纲）

## 原则

1. **TypeScript strict** —— 不用 `any`，必要时 `unknown` + 类型守卫
2. **领域类型唯一来源** —— 从 `@manga/types` 导入，不在 apps 内重复定义
3. **不写防御式代码** —— 内部边界信任 TS 类型；只在系统边界（用户输入、第三方 API、外部 JSON）做校验
4. **Zod 在边界** —— source-rules 解析、用户导入数据走 Zod；内部 store 之间不需要再校验
5. **不预测未来** —— 当前任务不需要的抽象、配置项、扩展点不写

## 必须

- ✅ 所有公共 export 显式类型签名（不依赖推导）
- ✅ 异步操作必须有错误分支（至少日志 + UI 反馈），不允许吞掉
- ✅ React 组件 props 用 `type` alias，不用 `interface`（统一）
- ✅ 文件最长 300 行，超过必须拆

## 禁止

- ❌ `console.log` 进 main 分支（`console.warn` / `console.error` 可保留必要场景）
- ❌ 跨 package 用相对路径（`import '../../../packages/types/...`），必须走 `@manga/types`
- ❌ 在共享 packages 里写平台判断分支（见 [`../architecture/packages.md`](../architecture/packages.md)）
- ❌ 注释解释代码做什么（见 [`completion.md`](./completion.md) 的注释规则）

## 命名简表

| 类别 | 风格 | 例 |
|---|---|---|
| 文件 | kebab-case | `parse-chapter.ts` |
| React 组件文件 | PascalCase | `SyncBar.tsx` |
| 测试 | `<name>.test.ts` 同目录 | `parse-chapter.test.ts` |
| 类型 / Zod 类型 | PascalCase | `SourceRule`, `Manga` |
| Zod schema 实例 | camelCase + Schema | `sourceRuleSchema` |
| 常量 | UPPER_SNAKE | `MAX_BOOKSHELF_ITEMS` |
| 函数 / 变量 | camelCase | `parseChapter`, `isOnMangaPage` |
| React hook | `useXxx` | `useBookshelf` |
| Zustand store | `useXxxStore` | `useBookshelfStore` |
| 事件 / action | 动词开头 | `addToBookshelf` |

## 包入口

- `index.ts` 只 re-export，不写实现
- 包内部互相 import 用相对路径，对外 import 用包名

## SourceRule id

- 全小写 + 连字符
- 站点缩写或英文别名
- 不要用真实域名作为 id
