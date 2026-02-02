"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Activity,
  Zap,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Search,
  Calendar,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    quota: 0,
    usedQuota: 0,
    requestCount: 0,
    todayQuota: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, quotaRes] = await Promise.all([
          fetch("/api/user/self"),
          fetch("/api/data/self/?default_time=today"),
        ]);

        const userJson = await userRes.json();
        const quotaJson = await quotaRes.json();

        if (userJson.success) {
          setUser(userJson.data);
          localStorage.setItem("user_info", JSON.stringify(userJson.data));
        }

        if (quotaJson.success) {
          // Simplified stats calculation
          const data = quotaJson.data || [];
          const totalUsed = data.reduce(
            (acc: number, item: any) => acc + (item.quota || 0),
            0,
          );
          const totalCount = data.reduce(
            (acc: number, item: any) => acc + (item.count || 0),
            0,
          );

          setStats((prev) => ({
            ...prev,
            usedQuota: totalUsed,
            requestCount: totalCount,
          }));
        }
      } catch (err) {
        // toast.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatQuota = (quota: number) => {
    if (!quota || quota === 0) return "$0.00";
    return `$${(quota / 500000).toFixed(2)}`;
  };

  const statCards = [
    {
      title: "当前余额",
      value: user ? formatQuota(user.quota) : "$0.00",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      desc: "可用额度",
    },
    {
      title: "今日消耗",
      value: formatQuota(stats.usedQuota),
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      desc: "相比昨日 +0%",
    },
    {
      title: "请求数",
      value: stats.requestCount.toString(),
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-500/10",
      desc: "今日累计请求",
    },
    {
      title: "API 状态",
      value: "运行正常",
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      desc: "节点响应正常",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            👋 欢迎回来, {user?.username || "用户"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            这是您的 API 使用数据概览
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar size={16} />
            最近 7 天
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 bg-blue-600 text-white"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            刷新数据
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Card
            key={idx}
            className="border-none shadow-sm shadow-slate-200 dark:shadow-none bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-transform"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", card.bg)}>
                  <card.icon size={24} className={card.color} />
                </div>
                <div className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-full">
                  {card.title}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {loading ? "..." : card.value}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {card.desc}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Placeholder */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-white/10 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">使用趋势</CardTitle>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-slate-800 shadow-sm">
                额度
              </button>
              <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
                次数
              </button>
            </div>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-slate-400 text-sm italic">
            此处为图表展示区域 (支持 ECharts/Recharts)
          </CardContent>
        </Card>

        {/* Quick Actions / Announcements */}
        <div className="space-y-8">
          <Card className="border-slate-200 dark:border-white/10 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">公告列表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <h5 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">
                  系统升级公告
                </h5>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                  我们最近优化了所有模型的响应延迟，建议将 API 基址切换为全域
                  CDN 节点。
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  欢迎体验 Gemini 1.5 Pro
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  完全免费，目前处于限时体验阶段。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-white/10 dark:bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-lg font-bold">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 rounded-2xl group hover:border-blue-500/50 transition-all"
              >
                <Key
                  size={20}
                  className="text-slate-400 group-hover:text-blue-500 transition-colors"
                />
                <span className="text-xs font-bold">创建令牌</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 rounded-2xl group hover:border-blue-500/50 transition-all"
              >
                <Search
                  size={20}
                  className="text-slate-400 group-hover:text-blue-500 transition-colors"
                />
                <span className="text-xs font-bold">查看日志</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
