# UI Rules

## 占位说明

设计系统候选未定。本文件待 [`docs/03-design.md`](../03-design.md) 落地后填充以下章节：

- 视觉语言：色板、字号阶、间距阶
- 组件骨架：Sync Bar / Popup tab / 卡片 / 列表 / 阅读器外壳
- 状态视觉规则：loading / empty / error 三态
- 暗色模式策略
- Tailwind v4 token 集中位置（`packages/ui-tokens` 还是各 app 内部）

## 不变约束（不依赖设计选择）

这些是**架构层**的 UI 约束，无论选哪套设计系统都适用：

- **Sync Bar 必须 Shadow DOM 隔离**，不污染原站样式
- **暗色模式 Day 1 支持**（漫画用户夜读多）
- **移动端最小触达 44×44px**
- **CJK 字符行高 ≥ 1.6**
- **WCAG AA 对比度**（普通文本对比度 ≥ 4.5:1）

## 暂不写组件细则

V1 阶段先把逻辑层跑通，UI 组件等设计稿落地。

参考 prep doc 的屏幕清单：[`docs/01-project-prep.md`](../01-project-prep.md) → "Main Interaction Design"。
