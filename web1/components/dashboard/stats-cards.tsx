"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { renderQuota, renderNumber, cn } from "@/lib/utils";
import {
  CreditCard,
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: any[];
  trendColor?: string;
  className?: string;
  onClick?: () => void;
  subValue?: string;
}

const MiniTrend = ({ data, color }: { data: any[]; color: string }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StatsCards = ({
  data,
  loading,
}: {
  data: any;
  loading: boolean;
}) => {
  const stats = [
    {
      title: "当前余额",
      value: renderQuota(data?.quota || 0),
      icon: <CreditCard className="w-4 h-4" />,
      className:
        "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900",
      trendColor: "#3b82f6",
      subValue: "点击充值",
    },
    {
      title: "今日消耗",
      value: renderQuota(data?.today_quota || 0),
      icon: <Zap className="w-4 h-4" />,
      className:
        "bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900",
      trendColor: "#f59e0b",
      trend: data?.trend?.consumeQuota,
    },
    {
      title: "今日调用",
      value: renderNumber(data?.today_times || 0),
      icon: <Activity className="w-4 h-4" />,
      className:
        "bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900",
      trendColor: "#10b981",
      trend: data?.trend?.times,
    },
    {
      title: "总调用次数",
      value: renderNumber(data?.times || 0),
      icon: <BarChart3 className="w-4 h-4" />,
      className:
        "bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900",
      trendColor: "#a855f7",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className={cn(
            "overflow-hidden border transition-all hover:shadow-md",
            stat.className,
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold tracking-tight">
                  {loading ? "..." : stat.value}
                </div>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-primary">
                    {stat.subValue}
                  </p>
                )}
              </div>
              {!loading && stat.trend && (
                <MiniTrend
                  data={stat.trend}
                  color={stat.trendColor || "#8884d8"}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
