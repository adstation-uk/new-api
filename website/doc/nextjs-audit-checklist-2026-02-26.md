# Next.js 项目审计清单（2026-02-26）

> 基于 `pnpm lint`、`pnpm build`、`pnpm exec tsc --noEmit` 与关键文件抽查。

## 总览

- TypeScript 错误总数：80
- 构建状态：`pnpm build` 失败（`/[locale]/model/[id]` Suspense 问题）
- Lint 状态：通过

---

## P0（先修，直接影响构建/核心稳定性）

- [ ] `useSearchParams` 缺少 Suspense 边界，导致构建失败
  - 现象：`pnpm build` 报错 `missing-suspense-with-csr-bailout`，路径 `"/[locale]/model/[id]"`
  - 关联文件：
    - `components/language-switcher.tsx`（使用 `useSearchParams`）
    - `components/navbar.tsx`（渲染 `LanguageSwitcher`）
    - `app/[locale]/model/[id]/page.tsx`（构建时触发）
  - 建议：在 `Navbar` 内对 `LanguageSwitcher` 增加 `Suspense` fallback，或将该逻辑改为不依赖 `useSearchParams`。

- [ ] `tsconfig` 同时包含 `.next/types` 与 `.next/dev/types`，触发路由类型冲突
  - 现象：`.next/types/validator.ts` 大量报错（18 条）
  - 关联文件：`tsconfig.json`
  - 建议：仅保留 `.next/types/**/*.ts`，移除 `.next/dev/types/**/*.ts`。

- [ ] TypeScript 校验被全局跳过，掩盖真实类型问题
  - 现象：构建输出 `Skipping validation of types`
  - 关联文件：`next.config.ts` (`typescript.ignoreBuildErrors: true`)
  - 建议：先分批修复主要 TS 错误后，关闭 `ignoreBuildErrors`。

---

## P1（高优先级，影响安全与可维护性）

- [ ] 存在未净化 HTML 注入点（XSS 风险）
  - 关联文件：
    - `app/[locale]/page.tsx`（`homeContent` 直接 `dangerouslySetInnerHTML`）
    - `components/dashboard/announcements-panel.tsx`（`marked.parse` 输出直接注入）
  - 建议：接入 HTML sanitization（例如 `rehype-sanitize` 或 DOMPurify 的服务端等价方案），或改为受控 MDX 渲染。

- [ ] Console Topup 路由静态/动态策略不清晰，构建阶段出现动态使用错误日志
  - 现象：`Dynamic server usage: ... used cookies`
  - 关联文件：`app/[locale]/console/topup/page.tsx`
  - 建议：显式声明动态策略（如 `export const dynamic = 'force-dynamic'`）并统一该 segment 的数据获取策略。

- [ ] 缺失错误与加载边界文件，异常体验/可恢复性不足
  - 现状：项目中未发现 `error.tsx`、`global-error.tsx`、`not-found.tsx`、`loading.tsx`
  - 建议：至少在 `app/[locale]` 与 `app/[locale]/console` 增加基础边界文件。

---

## P2（中优先级，类型债务与体验问题）

- [ ] 表单泛型错误集中在控制台编辑抽屉
  - Top files（按错误数）：
    - `app/[locale]/console/channel/channel-sheet.tsx`（13）
    - `app/[locale]/console/models/models-sheet.tsx`（12）
    - `app/[locale]/console/token/token-drawer.tsx`（11）
    - `app/[locale]/console/user/user-sheet.tsx`（8）
  - 建议：统一 `zodResolver` + `useForm<T>` + `FormField` 泛型，消除 `TFieldValues` 漂移。

- [ ] OAuth 方法调用参数与签名不一致
  - 关联文件：
    - `app/[locale]/console/personal/personal-client.tsx`
    - `lib/oauth.ts`
  - 建议：统一传参（补 `t`）或调整函数签名。

- [ ] `redirect` 调用类型不匹配
  - 关联文件：`actions/auth-actions.ts`
  - 建议：使用 `i18n/navigation` 的对象签名，或改用 `next/navigation` 的 `redirect`。

- [ ] 数据类型定义与面板 props 不一致
  - 关联文件：
    - `app/[locale]/console/page.tsx`
    - `components/dashboard/announcements-panel.tsx`
  - 建议：统一 `Announcement.type` 联合类型并在数据适配层收敛。

---

## P3（优化项）

- [ ] Next workspace root 推断警告
  - 现象：检测到多个 lockfile，root 推断到上级目录
  - 关联文件：`next.config.ts`
  - 建议：设置 `turbopack.root` 指向当前项目根目录。

- [ ] 图表类型定义存在错误
  - 关联文件：`components/ui/chart.tsx`、`components/dashboard/charts-panel.tsx`
  - 建议：整理图表配置类型、减少 `any` 与宽泛索引签名。

---

## 建议修复顺序（按迭代）

1. 迭代 1：修复 P0（Suspense + tsconfig includes + 明确类型策略）
2. 迭代 2：修复 P1（HTML 安全 + topup 动态策略 + 基础 error/loading/not-found）
3. 迭代 3：修复 P2（四个表单文件泛型 + OAuth + redirect + dashboard 类型）
4. 迭代 4：修复 P3（turbopack.root + chart 类型）

---

## 说明

- 本清单以“可逐项落地”为目标，优先修复会阻断构建和有潜在安全影响的问题。
- 如果需要，我可以从迭代 1 开始直接逐项修改并每步回归验证。
