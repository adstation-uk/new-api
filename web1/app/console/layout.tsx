import { getUserInfo } from "@/lib/user";

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 统一在布局层进行基础鑑权
  // 如果未登录，getUserInfo 内部会自动重定向到 /login
  await getUserInfo();

  return <>{children}</>;
}
