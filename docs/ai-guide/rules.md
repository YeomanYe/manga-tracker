# AI 协作规则

## 阅读顺序（任何任务）

1. `AGENTS.md` → `CONTRIBUTING.md` → `docs/01-project-prep.md`
2. 本文件 → 任务相关 `docs/<domain>/rules.md`
3. 用户的本次任务描述
4. 需要修改的目标文件

## 采证习惯

- 改动前**先读现有相关代码**，不要凭记忆推断结构
- 不确定的库 API 通过 `ref_search_documentation` 或 WebFetch 核实
- 给出文件路径必须是 absolute（`/Users/falcom/Documents/projects/manga-tracker/apps/extension/src/popup/index.tsx`）
- 跨多文件改动前先列计划，不要边想边改

## 完成判定

不允许仅凭"我觉得改完了"声明完成。必须：

1. 跑过 `pnpm check && pnpm test`
2. 真实终端输出粘进对话
3. 失败 case 显式列出，不偷藏

## 红线

- ❌ 不预置任何盗版漫画站 URL（即使是测试 fixture）
- ❌ 不直接 commit 到 main
- ❌ 不在共享 packages 里写平台分支（`if (isExtension)`）
- ❌ 不写超过 300 行的文件
- ❌ 不为不存在的需求加抽象 / 配置项 / 扩展点
- ❌ 不私自跑 `git push --force` / `git reset --hard` 等破坏性命令

## 与 Skills 的协作路由

| 任务类型 | 用哪个 Skill | 备注 |
|---|---|---|
| 写功能 / 修 bug / 重构 | `flow-dev-task` | 用户已声明所有项目代码改动走这条 |
| 项目重新规划 / kickoff | `flow-project-bootstrap` | 一次完成 prep + rules + design |
| 项目收尾 | `flow-project-finish` | 同步设计回 docs / 起 README / 做落地页 |
| 写 / 改 skill | `orchestrating-skill-development` | 不直接动 skill 文件 |
| UI 组件抽取 / 重构 | `flow-jsx-ui` | JSX 项目专用 |
| 上架扩展 | `flow-ext-publish` | 第二阶段才用 |
| 性能优化 | `webperf` 系列 | 按子主题选 |
| 浏览器自动化 / 真实环境验证 | `agent-browser` 或 `cdp-browser-control` | content script 真实抓取测试 |

## 项目文档 vs Skill 方法论

- 本仓库的 `docs/<domain>/rules.md` 是**项目专属约束**
- Skills 提供**通用方法论**
- 当两者冲突，**项目文档优先**（用户在本仓库的明示约束）

## AI 自检节点

任务完成自审时，按 `flow-dev-task` 的 delivery-gate 流程：

1. 是否产生 lint / test 错误（必须 0）
2. 是否需要 Playwright 截图（UI 变更时是）
3. 是否触发 `verification-before-completion`
4. commit message 是否符合 Conventional Commits
5. 是否触碰任何"红线"条目

任意一项不过 → 不能声明完成。
