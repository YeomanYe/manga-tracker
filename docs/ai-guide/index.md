# AI Guide

> AI（Claude / Cursor / Copilot 等）在本项目里如何工作。

## 文件

- [`rules.md`](./rules.md) — AI 阅读顺序、采证习惯、红线、与 flow-* skills 协作约定

## 入口

AI 启动会话时，按以下顺序读：

1. 项目根 [`AGENTS.md`](../../AGENTS.md)
2. [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
3. [`docs/01-project-prep.md`](../01-project-prep.md)
4. 本目录 `rules.md`
5. 任务相关领域文档
