"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ListFilter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Log {
  id: number;
  created_at: number;
  type: number;
  username: string;
  token_name: string;
  model_name: string;
  quota: number;
  prompt_tokens: number;
  completion_tokens: number;
  use_time: number;
  channel_id: number;
  content: string;
}

interface LogClientProps {
  initialLogs: Log[];
  total: number;
  page: number;
  pageSize: number;
  keyword: string;
}

export function LogClient({
  initialLogs,
  total,
  page,
  pageSize,
}: LogClientProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");

  const handlePageChange = (newPage: number) => {
    router.push(`/console/log?p=${newPage}`);
    // If we support search in future, add keyword here
  };

  const renderType = (type: number) => {
    switch (type) {
      case 1:
        return (
          <span className="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400 px-2 py-0.5 rounded text-xs font-medium">
            充值
          </span>
        );
      case 2:
        return (
          <span className="text-lime-600 bg-lime-100 dark:bg-lime-900/30 dark:text-lime-400 px-2 py-0.5 rounded text-xs font-medium">
            消费
          </span>
        );
      case 3:
        return (
          <span className="text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-medium">
            管理
          </span>
        );
      case 4:
        return (
          <span className="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium">
            系统
          </span>
        );
      case 5:
        return (
          <span className="text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium">
            错误
          </span>
        );
      default:
        return (
          <span className="text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded text-xs font-medium">
            未知
          </span>
        );
    }
  };

  const renderQuota = (quota: number) => {
    return `$${(quota / 500000).toFixed(6)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">使用日志</h1>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索日志..."
                className="pl-8"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <ListFilter size={16} />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>模型</TableHead>
                <TableHead>用户 / 令牌</TableHead>
                <TableHead>提示 / 补全 / 配额</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                initialLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>{renderType(log.type)}</TableCell>
                    <TableCell>
                      {log.model_name && (
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-mono border border-border">
                          {log.model_name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>{log.username}</span>
                        <span className="text-xs text-muted-foreground/70">
                          {log.token_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          提示: {log.prompt_tokens}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          补全: {log.completion_tokens}
                        </span>
                        <span className="font-medium">
                          {renderQuota(log.quota)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.use_time}ms
                    </TableCell>
                    <TableCell
                      className="text-sm max-w-[200px] truncate text-muted-foreground"
                      title={log.content}
                    >
                      {log.content}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {total} 条数据
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => handlePageChange(page + 1)}
              >
                下一页
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
