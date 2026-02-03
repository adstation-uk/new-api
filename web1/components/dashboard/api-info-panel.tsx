"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ApiInfoPanelProps {
  apiKey?: string;
}

export const ApiInfoPanel = ({ apiKey = "sk-..." }: ApiInfoPanelProps) => {
  const [copied, setCopied] = React.useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API Key 已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="lg:col-span-3 border-none shadow-sm dark:bg-gray-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-lg font-semibold">快速开始</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              您的个人令牌 (默认)
            </label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
              <code className="flex-1 text-xs font-mono break-all line-clamp-1">
                {apiKey}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={copyKey}
              >
                {copied ? (
                  <Check className="h-4 h-4 text-green-500" />
                ) : (
                  <Copy className="h-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/console/token"
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">管理令牌</span>
                <span className="text-[10px] text-muted-foreground">
                  创建和分配额度
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            <a
              href="/docs"
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">官方文档</span>
                <span className="text-[10px] text-muted-foreground">
                  查看集成教程
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="text-xs font-bold text-primary mb-1 uppercase">
              配置基地址
            </h4>
            <p className="text-xs text-foreground/80 leading-relaxed font-mono">
              Base URL:{" "}
              {typeof window !== "undefined" ? window.location.origin : ""}/v1
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
