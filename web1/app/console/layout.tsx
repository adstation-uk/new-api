import { ConsoleNavbar } from "@/components/console-navbar";
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
  // const statusRes = await getStatus();
  // const status = statusRes.success ? statusRes.data : {};

  return (
    <div className="min-h-screen">
      {/* Top spacing for fixed global navbar (approx 64px) */}

      {/* Secondary Menu */}
      <ConsoleNavbar user={user} />

      <main className="container mx-auto px-4 md:px-8 py-8  animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
