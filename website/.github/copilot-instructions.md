# Project Guidelines

## Code Style

- 使用 TypeScript 严格模式与 `@/*` 路径别名（参见 `tsconfig.json`）。
- ESLint 基于 `@antfu/eslint-config`，类型定义优先 `type`（参见 `eslint.config.mjs`）。
- 客户端组件必须显式添加 `use client`（示例：`components/login-form.tsx`）。
- 样式类名合并统一使用 `cn`（来源：`lib/utils.ts`）。
- 复用现有 `components/ui/*` 组件与 Tailwind 变量，不新增独立设计体系（参见 `components.json`、`app/globals.css`）。

## Architecture

- 使用 Next.js App Router，主路由位于 `app/[locale]`，全局布局见 `app/[locale]/layout.tsx`。
- 控制台区域位于 `app/[locale]/console/*`，并在布局中进行用户态校验（`app/[locale]/console/layout.tsx`）。
- 后端请求统一通过 `lib/api.ts`，避免在页面/组件中硬编码后端地址。
- 写操作优先放在 server actions（`actions/*` 与各模块 `actions.ts`），并配合 `revalidatePath` 刷新页面。
- 模型元数据与文档分离：`config/models.ts` + `content/models/*.mdx`。

## Build and Test

- 安装依赖：`pnpm install`
- 本地开发：`pnpm dev`（端口 `3346`）
- 生产构建：`pnpm build`
- 生产启动：`pnpm start`
- 代码检查：`pnpm lint`
- 自动修复：`pnpm lint:fix`
- 测试：当前 `package.json` 未发现明确 `test` 脚本约定。

## Project Conventions

- 国际化固定 `en/zh`，并使用 `localePrefix: 'always'`（`i18n/routing.ts`）。
- 页面跳转与路由工具优先使用 `i18n/navigation.ts` 封装。
- 控制台列表常用查询参数命名：`p`、`size`、`keyword`（示例：`app/[locale]/console/log/page.tsx`）。
- 控制台数据页默认服务端获取并倾向 `cache: 'no-store'`（示例：`app/[locale]/console/channel/page.tsx`）。
- MDX 渲染与代码高亮遵循现有实现（`mdx-components.tsx`、`components/mdx/mdx-code-block.tsx`）。

## Integration Points

- 反向代理与重写规则见 `proxy.ts` 与 `next.config.ts`（`/api`、`/v1`、`/mj`、`/pg`）。
- 登录/注册流程为 server action + 表单校验（`actions/login-action.ts`、`actions/register-action.ts`）。
- OAuth 登录入口与可用性判断见 `lib/oauth.ts`、`components/login-form.tsx`。
- 会话相关能力集中在 `lib/session.ts` 与 `lib/user.ts`。
- 充值支付集成位于 `app/[locale]/console/topup/*`。

## Security

- 登录后写入会话 Cookie，使用 `httpOnly`、`sameSite`、生产环境 `secure`（`actions/login-action.ts`）。
- `lib/api.ts` 会透传 Cookie 到后端；改动请求逻辑时需保持认证链路一致。
- 未登录/无权限访问通过服务端重定向处理（`lib/user.ts`）。
- 涉及会话、鉴权、代理的改动需优先检查：`lib/session.ts`、`lib/user.ts`、`proxy.ts`。
