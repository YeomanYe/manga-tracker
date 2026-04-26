# UI Rules

> v1 选定 **Candidate A · Tooling Mono**。Preview 站在 `site/preview/` 实现，可作为视觉规范的活样本。

## 视觉语言（Tooling Mono）

| 维度 | 暗色（默认） | 亮色（辅助） |
|---|---|---|
| 背景基底 | `#0E0E10` / `#16161A` | `#FAFAFA` / `#FFFFFF` |
| 主色（accent） | `#F5A524`（琥珀黄） | 同色降饱和 5% |
| 关键中性 | Slate 灰阶 `#27272A` → `#71717A` | 反向 |
| 状态色 | success `#22C55E` / warn `#F59E0B` / error `#EF4444` | 同 |

具体 hex 集中放 `apps/<x>/src/styles/tokens.css`（v4 用 CSS variables）。**不允许在组件里硬编码 hex**，必须走 token。

## 字体

- 拉丁：`Inter` 或 `Geist`（变量字重）
- CJK：`Source Han Sans` 或 `HarmonyOS Sans SC`（黑体）
- Mono（章节号 / ID）：`JetBrains Mono` 或 `Geist Mono`

## 布局 / 密度

- 间距系统 4pt 起步：`4 / 8 / 12 / 16 / 24 / 32 / 48`
- 列表行高：36-40px（紧凑但触达友好）
- 圆角：`4 / 6 / 8`px（不要 12+ 大圆角，太软）
- 分隔靠 1px subtle border，少用阴影

## 状态视觉规则（必须四态）

每个异步加载的组件都要有显式四态：

| 状态 | 视觉 |
|---|---|
| **Normal** | 正常渲染数据 |
| **Empty** | 居中图标 + 标题 + 一行说明 + Primary CTA（如"装扩展"） |
| **Loading** | Skeleton（与最终布局尺寸一致），不用 spinner |
| **Error** | 红色图标 + 标题 + 解释 + Secondary CTA（重试） |

参考 Preview 站 Popup 区域的实现。

## 暗色模式

- Day 1 支持，**默认暗色**（漫画用户夜读多）
- 亮色用户从 toolbar 切换，存 `localStorage.theme`
- 颜色 token 不靠"反转"，每套独立调（暗色降饱和 5-10%）

## 不变约束（不依赖候选选择）

- **Sync Bar 必须 Shadow DOM 隔离**，不污染原站样式
- **移动端最小触达 44×44px**
- **CJK 字符行高 ≥ 1.6**
- **WCAG AA 对比度**（普通文本对比度 ≥ 4.5:1）

## 动效

- 状态切换 100-180ms ease-out
- Sync Bar 出现：opacity fade + 4px translateY，**无 scale 无 spring**
- Toast：底部 slide-in 8px + fade，2s 自动消失
- 不用 spring 物理动画；用户感受到"反应迅速" > "有趣"

## 走查方式

每个 UI 组件改完之后：

1. 在 Preview 站对应宿主里走查（normal / empty / loading / error 全部切一遍）
2. 切到 Light 主题再走查一遍
3. 没问题再装到真实环境（unpacked 扩展 / debug APK）

## 候选 B / C 的归宿

设计文档保留了 Inkmono / Hanji Reading 两套候选的 ASCII 对比和定位。当前不实现。如果未来做品牌升级（Phase 3 商业化前），优先重新评估 B（识别度最强）。
