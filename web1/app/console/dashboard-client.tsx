"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Calendar, RefreshCw, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel";
import { ApiInfoPanel } from "@/components/dashboard/api-info-panel";
import { UptimePanel } from "@/components/dashboard/uptime-panel";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  user: any;
  status: any;
  quotaData: any[];
  uptimeData: any[];
}

export function DashboardClient({
  user,
  status,
  quotaData,
  uptimeData,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const loading = isPending;

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

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
            onClick={handleRefresh}
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
