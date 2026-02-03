"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Calendar, RefreshCw, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel";
import { ApiInfoPanel } from "@/components/dashboard/api-info-panel";
import { UptimePanel } from "@/components/dashboard/uptime-panel";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [quotaData, setQuotaData] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, quotaRes, statusRes, uptimeRes] = await Promise.all([
        fetch("/api/user/self"),
        fetch("/api/data/self/?default_time=today"),
        fetch("/api/status"),
        fetch("/api/uptime/status").catch(() => null),
      ]);

      const userJson = await userRes.json();
      const quotaJson = await quotaRes.json();
      const statusJson = await statusRes.json();
      const uptimeJson = uptimeRes
        ? await uptimeRes.json()
        : { success: false };

      if (userJson.success) setUser(userJson.data);
      if (quotaJson.success) setQuotaData(quotaJson.data || []);
      if (statusJson.success) setStatus(statusJson.data);
      if (uptimeJson.success) {
        // Flatten uptime data if it's grouped
        const allMonitors =
          uptimeJson.data.flatMap((group: any) =>
            group.monitors.map((m: any) => ({
              name: m.name,
              status: m.status === 1 ? "up" : "down",
              uptime: m.uptime,
            })),
          ) || [];
        setUptimeData(allMonitors);
      }
    } catch (err) {
      console.error(err);
      toast.error("数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process data for charts
  const processedChartData = useMemo(() => {
    if (!quotaData) return {};

    // 1. Consume distribution (Pie)
    const modelConsumption: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    const hourMap: Record<string, any> = {};

    quotaData.forEach((item) => {
      const model = item.model_name || "unknown";
      // Consumption
      modelConsumption[model] =
        (modelConsumption[model] || 0) + (item.quota || 0);
      // Counts
      modelCounts[model] = (modelCounts[model] || 0) + (item.count || 0);

      // Timeline grouping by hour
      const time = new Date(item.created_at * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!hourMap[time]) hourMap[time] = { Time: time, Usage: 0 };
      hourMap[time].Usage += item.quota;
      hourMap[time][model] = (hourMap[time][model] || 0) + item.quota;
    });

    const pieData = Object.entries(modelConsumption)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const barData = Object.entries(modelCounts)
      .map(([Model, Counts]) => ({ Model, Counts }))
      .sort((a, b) => b.Counts - a.Counts)
      .slice(0, 10);

    const lineData = Object.values(hourMap).sort((a: any, b: any) =>
      a.Time.localeCompare(b.Time),
    );

    // Trend for stats cards
    const timesTrend = lineData.map((d: any) => ({ value: d.Usage || 0 }));
    const quotaTrend = lineData.map((d: any) => ({ value: d.Usage || 0 }));

    return {
      pieData,
      barData,
      lineData,
      trend: {
        times: timesTrend,
        consumeQuota: quotaTrend,
      },
    };
  }, [quotaData]);

  const dashboardStats = {
    quota: user?.quota || 0,
    today_quota: quotaData.reduce((acc, curr) => acc + curr.quota, 0),
    times: user?.request_count || 0, // Fallback if not in user
    today_times: quotaData.reduce((acc, curr) => acc + curr.count, 0),
    trend: processedChartData.trend,
  };

  const announcements = useMemo(() => {
    if (!status?.notice) return [];
    // Basic mock of announcements from notice string or a dedicated API if available
    // Here we split by newlines as a simple heuristic
    return [
      {
        content: status.notice,
        time: "当前",
        type: "info",
      },
    ] as any[];
  }, [status]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            刷新
          </Button>
        </div>
      </div>

      {/* Basic Stats */}
      <StatsCards data={dashboardStats} loading={loading} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Col: Charts */}
        <ChartsPanel data={processedChartData} loading={loading} />

        {/* Right Col: Info & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <ApiInfoPanel apiKey={user?.access_token || "sk-..."} />
          <AnnouncementsPanel data={announcements} loading={loading} />
        </div>
      </div>

      {/* Uptime Section */}
      <UptimePanel data={uptimeData} loading={loading} />
    </div>
  );
}
