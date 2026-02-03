"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info } from "lucide-react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

interface Announcement {
  content: string;
  time: string;
  type?: "default" | "info" | "success" | "warning" | "error";
  extra?: string;
  relative?: string;
}

interface AnnouncementsPanelProps {
  data: Announcement[];
  loading: boolean;
}

export const AnnouncementsPanel = ({
  data,
  loading,
}: AnnouncementsPanelProps) => {
  return (
    <Card className="lg:col-span-2 border-none shadow-sm dark:bg-gray-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-semibold">系统公告</CardTitle>
        </div>
        <div className="text-[10px] uppercase font-bold text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          最新 20 条
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 mt-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : data.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
              {data.map((item, idx) => {
                const htmlContent = marked.parse(item.content || "");
                const htmlExtra = item.extra ? marked.parse(item.extra) : "";

                return (
                  <div key={idx} className="relative pl-6">
                    {/* dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-1.5 w-[12px] h-[12px] rounded-full border-2 border-white dark:border-gray-950 z-10",
                        item.type === "info"
                          ? "bg-blue-500"
                          : item.type === "warning"
                            ? "bg-orange-500"
                            : item.type === "error"
                              ? "bg-red-500"
                              : "bg-gray-400",
                      )}
                    />

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        {item.time} {item.relative && `(${item.relative})`}
                      </span>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                      />
                      {item.extra && (
                        <div
                          className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-[11px] text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: htmlExtra }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Info className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">暂无系统公告</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
