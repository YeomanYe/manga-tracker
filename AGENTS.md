# AI Agents Guide

> 任何 AI（Claude / Cursor / Copilot / 其他）在本项目里工作的统一入口。

## 阅读顺序

1. 本文件（你正在读的）
2. [`CONTRIBUTING.md`](./CONTRIBUTING.md) — 工程总入口
3. [`docs/01-project-prep.md`](./docs/01-project-prep.md) — MVP 范围 + 主交互
4. [`docs/ai-guide/rules.md`](./docs/ai-guide/rules.md) — AI 协作详细约定
5. 任务相关领域文档（按需）

## 三条铁律

1. **代码改动必须经 `flow-dev-task` 编排**（用户已声明，除非明示绕过）
2. **不向 main 直接 commit**，全部走 PR
3. **不信任自己的成功声明**：必须跑 `pnpm test && pnpm check` 通过再说"做完了"

## 项目特殊性

- 单人 + AI 协作：AI 既是协作者也是审稿人；提交前自审过一遍再交付
- 第一阶段无后端：任何"写到云端"的请求要先停下确认（可能是误解需求）
- **合规底线**：不预置任何盗版漫画站 URL 到代码、测试 fixture 或文档（详见 [`docs/architecture/rules.md`](./docs/architecture/rules.md)）
