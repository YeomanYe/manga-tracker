# Contributing to manga-tracker

> 单人 + AI 协作的工程规范入口。第一阶段（6-8 周）的开发指南。

## TL;DR

- 写代码前先读 [`docs/ai-guide/rules.md`](./docs/ai-guide/rules.md)
- 不确定代码放哪 → [`docs/architecture/`](./docs/architecture/index.md)
- 不确定怎么写 → [`docs/coding/`](./docs/coding/index.md)
- 不确定 UI 怎么做 → [`docs/ui/`](./docs/ui/index.md)（设计系统未定）
- 提交前 → [`docs/coding/completion.md`](./docs/coding/completion.md)

## 环境

- Node.js ≥ 20.10
- pnpm ≥ 9（必须，不要用 npm/yarn）
- Android Studio + JDK 17（移动端构建用）
- Chrome / Edge（扩展开发）

## 初始化

```bash
pnpm install
pnpm build:packages    # 先编译共享 packages
```

## 跑各端

| 任务 | 命令 |
|---|---|
| 扩展 dev（unpacked 目录在 `apps/extension/dist`） | `pnpm dev:extension` |
| 扩展打包 release zip | `pnpm build:extension` |
| 移动端 web dev（浏览器调试 UI） | `pnpm dev:mobile` |
| 移动端同步到 Android 工程 | `pnpm sync:android` |
| 移动端构建 debug APK | `pnpm build:android:debug` |
| 跑全量测试 | `pnpm test` |
| Lint + 格式检查 | `pnpm check` |
| 自动修复 | `pnpm check:fix` |

> 命令对应的 turbo task 在 `turbo.json` 定义，第一次开发时由 `flow-dev-task` 落地。

## 文档导航

- 工程架构：[`docs/architecture/`](./docs/architecture/index.md)
- 编码规范：[`docs/coding/`](./docs/coding/index.md)
- UI 规范：[`docs/ui/`](./docs/ui/index.md)
- 测试规范：[`docs/testing/`](./docs/testing/index.md)
- AI 协作：[`docs/ai-guide/`](./docs/ai-guide/index.md)
- 项目背景与 MVP：[`docs/01-project-prep.md`](./docs/01-project-prep.md)

## Commit 风格

[Conventional Commits](https://www.conventionalcommits.org/)：`type(scope): summary`

- types：`feat` / `fix` / `refactor` / `docs` / `test` / `chore` / `build` / `ci`
- scopes：`extension` / `mobile` / `source-rules` / `injector` / `types` / `storage` / `repo` / `docs`

例：`feat(extension): inject sync bar on detail pages`

## 分支与 PR

单人项目，主流程：

- `main`：稳定可跑
- `feat/<scope>-<name>`：日常开发
- 自己合并自己也走 PR 流程（写 PR 描述 + 等本地 CI 通过 + squash merge）
- AI 协作产出的代码必须本地验证后再合（见 [`docs/ai-guide/rules.md`](./docs/ai-guide/rules.md)）
