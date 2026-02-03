import { ConsoleSidebar } from "@/components/console-sidebar";
import { getUserInfo } from "@/lib/user";
import { api } from "@/lib/api";

async function getStatus() {
  try {
    const res = await api("/api/status");
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserInfo();
  const statusRes = await getStatus();
  const status = statusRes.success ? statusRes.data : {};

  return (
    <div className="flex pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
      <ConsoleSidebar user={user} status={status} />
      <main className="flex-1 transition-all duration-300 ml-64 overflow-x-hidden">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
