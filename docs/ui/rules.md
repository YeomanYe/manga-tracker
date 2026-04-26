# UI Rules

> v1 选定 **Candidate B · Inkmono**。视觉语言落地在 `packages/ui-kit/src/tokens/inkmono.css`，组件实现在 `packages/ui-kit/src/`。Preview 站（`apps/preview/`）用同一份组件，所见即所得。

## 视觉语言（Inkmono · 暗色为主调 + 漫画印刷质感）

| 维度 | 暗色（默认主战场） | 亮色（辅助） |
|---|---|---|
| 背景基底 | 深蓝灰 `#0F1419` / 暗紫 `#15131C`（不纯黑，留温度） | 米白 `#F5F1EA`（带温度，不冷白） |
| 主色（绛红 / 文化感） | `#C2410C` | 同色，提饱和 5% |
| 强调（金箔黄） | `#EAB308`（仅章节翻页指示 / 关键 CTA，小面积） | `#B8860B` |
| 关键中性 | 暖灰阶 `#1F1B17` → `#A8A29E` | 反向 |
| 状态色 | 保持语义但低饱和 | 同 |

具体值集中在 `packages/ui-kit/src/tokens/inkmono.css`。**禁止在组件里硬编码 hex**，必须走 `var(--ink-*)` token。

## 字体

- **拉丁主体**：Pretendard（首选）/ JetBrains Mono（辅助 mono）
- **CJK**：
  - **Source Han Serif（思源宋体）** —— 用于作品名、章节标题、Sync Bar 标题、卡片 hero
  - **Source Han Sans / Pretendard** —— 用于列表元数据、按钮文本、设置页 label
  - **双体并用**：营造"杂志感"，重要文本用衬线，UI label 用黑体保证可读
- **Mono**（章节号 / source-id / URL）：JetBrains Mono / SF Mono / Menlo

## 印刷质感（Inkmono 标志性）

- Sync Bar 折叠态和展开态使用 **5% opacity 颗粒纹理**（CSS 变量 `--ink-grain-opacity`）
- 实现：`.ink-grain` 类，伪元素叠 `mix-blend-mode: overlay` + SVG turbulence
- 分隔靠**1px 暗色边框**（不是阴影），有"印刷边缘"质感
- 圆角偏几何：4-6px（不要 12+ 大圆角，气质会软）

## 布局 / 密度

- 间距：8pt 起步（8/12/16/24/32），中等密度，不极简
- 卡片有可见的 1px 边框（非阴影）
- 列表行高 40-44px，触达友好
- 每屏只有一个主 CTA，用主色（绛红）+ 加大字号 + 衬线标注

## 状态视觉规则（必须四态）

每个异步加载的组件都要有显式四态：

| 状态 | 视觉 |
|---|---|
| **Normal** | 正常渲染数据 |
| **Empty** | 居中圆形占位图标 + 衬线标题 + 一行说明 + Primary CTA |
| **Loading** | Skeleton（与最终布局尺寸一致），不用 spinner |
| **Error** | 红色边框圆形图标 + 衬线标题 + 解释 + Secondary CTA（重试） |

实现见 `packages/ui-kit/src/states/States.tsx`。

## 暗色模式

- Day 1 支持，**默认暗色**（漫画用户夜读多）
- 亮色用户从顶部 toolbar 切换，存 `localStorage.theme`
- 颜色 token 不靠"反转"，每套独立调（暗色暖灰、亮色书页米白）
- 切换通过 `document.documentElement.dataset.theme = 'dark' | 'light'`

## 不变约束（任何视觉决策都必须满足）

- **Sync Bar 必须 Shadow DOM 隔离**，不污染原站样式（包括颗粒纹理）
- **移动端最小触达 44×44px**
- **CJK 字符行高 ≥ 1.6**
- **WCAG AA 对比度**（普通文本 ≥ 4.5:1）
- 颗粒图案 opacity ≤ 5%，不影响可读性

## 动效（Inkmono · 中速有重量感）

- Sync Bar 出现：`translateY(16px) + scale(0.96 → 1) + fade`，220ms ease-out
- Toast：模拟"印章盖下" - `scale(1.1 → 1) + fade`，280ms spring
- 章节翻页：横向 slide 带轻微透视
- Hover：底部 1px 颜色填充条
- 状态切换：100-180ms ease-out

## 走查方式

每个 UI 组件改完之后：

1. 在 Preview 站对应宿主里走查（normal / empty / loading / error 全部切一遍）
2. 切到 Light 主题再走查一遍
3. 没问题再装到真实环境（unpacked 扩展 / debug APK）

Preview 站直接 import 你改的组件，**无需复制粘贴**——这是 Inkmono 选 B 配 monorepo 的关键收益。

## 候选 A / C 的归宿

设计文档保留了 Tooling Mono / Hanji Reading 两套候选作为对比。当前不实现。如果未来做品牌升级或 v2 改版，可重新评估。
