import { api } from "@/lib/api";
import { LayoutDashboard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processDashboardData } from "@/lib/dashboard-utils";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel";
import { ApiInfoPanel } from "@/components/dashboard/api-info-panel";
import { UptimePanel } from "@/components/dashboard/uptime-panel";
import { RefreshButton } from "@/components/dashboard/refresh-button";

async function getDashboardData() {
  try {
    const [userRes, quotaRes, statusRes, uptimeRes] = await Promise.all([
      api("/api/user/self"),
      api("/api/data/self/?default_time=today"),
      api("/api/status"),
      api("/api/uptime/status").catch((e) => ({
        json: async () => ({ success: false }),
        ok: false,
      })),
    ]);

    const userJson = await userRes.json();
    const quotaJson = await quotaRes.json();
    const statusJson = await statusRes.json();

    // Safety check for uptime response
    let uptimeJson = { success: false, data: [] };
    try {
      if (uptimeRes && typeof uptimeRes.json === "function") {
        uptimeJson = await uptimeRes.json();
      }
    } catch (e) {
      // ignore uptime parse errors
    }

    const userData = userJson.success ? userJson.data : null;
    const quotaData = quotaJson.success ? quotaJson.data || [] : [];
    const statusData = statusJson.success ? statusJson.data : null;

    let uptimeData = [];
    if (uptimeJson.success && Array.isArray(uptimeJson.data)) {
      // Flatten uptime data if it's grouped
      uptimeData =
        uptimeJson.data.flatMap((group: any) =>
          group.monitors.map((m: any) => ({
            name: m.name,
            status: m.status === 1 ? "up" : "down",
            uptime: m.uptime,
          })),
        ) || [];
    }

    return {
      user: userData,
      quotaData,
      status: statusData,
      uptimeData,
    };
  } catch (e) {
    console.error("Failed to fetch dashboard data", e);
    return {
      user: null,
      quotaData: [],
      status: null,
      uptimeData: [],
    };
  }
}

export default async function DashboardPage() {
  const { user, quotaData, status, uptimeData } = await getDashboardData();
  const processedChartData = processDashboardData(quotaData);

  const dashboardStats = {
    quota: user?.quota || 0,
    today_quota: quotaData.reduce((acc, curr) => acc + curr.quota, 0),
    times: user?.request_count || 0,
    today_times: quotaData.reduce((acc, curr) => acc + curr.count, 0),
    trend: processedChartData.trend,
  };

  const announcements = status?.notice
    ? [
        {
          content: status.notice,
          time: "当前",
          type: "info",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">数据看板</h2>
            <p className="text-sm text-muted-foreground">
              欢迎回来，{user?.username || "用户"}。这是您的账户活跃情况概览。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Calendar className="w-4 h-4" />
            今日数据
          </Button>
          <RefreshButton />
        </div>
      </div>

      {/* Basic Stats */}
      <StatsCards data={dashboardStats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Charts */}
        <ChartsPanel data={processedChartData} />

        {/* Right Col: Info & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <ApiInfoPanel apiKey={user?.access_token || "sk-..."} />
          <AnnouncementsPanel data={announcements} />
        </div>
      </div>

      {/* Uptime Section */}
      <UptimePanel data={uptimeData} />
    </div>
  );
}
