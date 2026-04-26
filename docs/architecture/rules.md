# Architecture Rules

## 总则

1. **业务逻辑必须放共享 packages**，不允许在 `apps/extension` 和 `apps/mobile` 各写一份
2. **依赖方向单向**：`apps/*` → `packages/*`；`packages/*` 之间允许互依，但**禁止环依赖**
3. **平台细节不外泄**：`chrome.*` API 不进 `packages/`；Capacitor 插件不进 `packages/`
4. **存储统一抽象**：所有持久化通过 `packages/storage-adapter` 接口，不直接调 IndexedDB / SQLite
5. **类型唯一来源**：领域类型一律放 `packages/types`，apps 不重新定义

## 包依赖图（允许方向）

```
apps/extension ─┐         ┌── packages/source-rules
apps/mobile    ─┼────────►├── packages/injector
                │         ├── packages/storage-adapter
                │         └── packages/types ◄── (其他 packages 可依赖)
                └─────────┘
```

反向（任何 `packages/*` → `apps/*`）禁止。

## 合规底线（项目特殊性）

- **不在仓库里硬编码任何盗版漫画站 URL** —— 域名、规则文件、测试 fixture 都不允许
- 测试 / 文档需要 URL 时，统一用 `https://example.com/manga/...` 占位
- 真实源规则由用户运行时导入，不打包进 release artifact
- README / 文档可解释规则格式，但不附"已适配站点清单"
- 这一条是 hard rule，AI 协作时也必须遵守（见 [`../ai-guide/rules.md`](../ai-guide/rules.md)）

## 版本管理

- Monorepo 同步版本（所有 packages 共用 root `package.json` 的 version）
- 第一阶段不发 npm，不需要独立版本号
- 第二阶段如果开放 source-rules 给社区订阅，再考虑独立版本
