# 提交前检查

## 本地验证清单

```bash
pnpm check          # Biome lint + format
pnpm test           # Vitest
pnpm build          # 全量构建（可选，CI 会跑）
```

三个全过才能 push。失败原因要修，不要 `--no-verify` 跳过。

## Commit message

[Conventional Commits](https://www.conventionalcommits.org/)：

```
type(scope): summary
```

- types：`feat` / `fix` / `refactor` / `docs` / `test` / `chore` / `build` / `ci`
- scopes：`extension` / `mobile` / `source-rules` / `injector` / `types` / `storage` / `repo` / `docs`

例：
- `feat(injector): add chapter detection hook`
- `fix(extension): popup crash on empty bookshelf`
- `refactor(storage): unify sqlite and idb error types`

每个 commit 单一目的；不能既改业务又顺手 lint fix（拆开）。

## PR 流程（自己 review 自己也走）

1. 从 `main` 切 `feat/<scope>-<name>` 分支
2. 完成后开 PR
3. 写 PR 描述：
   - **Why**：解决什么问题
   - **What**：改了哪些文件
   - **How to test**：手动验证步骤
4. 等本地 CI 模拟通过（`pnpm check && pnpm test && pnpm build`）
5. Squash merge

## 不要做的事

- 不要 `--no-verify` 跳 hook
- 不要 force push `main`
- 不要 commit `node_modules` / `dist` / `.env*`
- 不要在一次 commit 里改 5 个不相关 scope

## 注释规则

### 默认：不写

只在以下情况写：

1. **隐藏约束**：调用方不可见的必须遵守的前置条件
2. **不变式**：维护者改动时容易破坏的不变式
3. **特定 bug 的 workaround**：必须留 issue 链接
4. **令人意外的行为**：读者会"咦？为什么这样"的地方

### 不要写

- ❌ 解释代码做什么（命名应自解释）
- ❌ 引用当前 PR / 任务 / issue（git history 已有，会过时）
- ❌ "// removed X" / "// renamed Y to Z" 这种考古注释
- ❌ Module-level 长文档注释（除非是公共包入口）

### 公共包 API

`packages/*/src/index.ts` 导出的函数 / 类型可以有简短 JSDoc：

```ts
/** Parse a SourceRule JSON, throwing if schema invalid. */
export function parseSourceRule(json: unknown): SourceRule;
```

不写参数和返回值描述（TS 类型已表达）。
