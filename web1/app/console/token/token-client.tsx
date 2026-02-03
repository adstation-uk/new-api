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
import { Copy, Eye, EyeOff, Plus, Search, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { deleteToken } from "./actions";

interface Token {
  id: number;
  name: string;
  key: string;
  status: number;
  used_quota: number;
  remain_quota: number;
  expired_time: number;
  unlimited_quota: boolean;
  created_time: number;
  accessed_time: number;
}

interface TokenClientProps {
  initialTokens: Token[];
  total: number;
  page: number;
  pageSize: number;
  keyword: string;
}

export function TokenClient({
  initialTokens,
  total,
  page,
  pageSize,
  keyword,
}: TokenClientProps) {
  const router = useRouter();
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  const [isPending, setIsPending] = useState(false);

  // Use local state for immediate feedback, but sync with props
  // Actually simplest is just use props for data, and local for interactive UI like showKey

  const handleSearch = (val: string) => {
    setSearchKeyword(val);
  };

  const executeSearch = () => {
    router.push(
      `/console/token?p=1&keyword=${encodeURIComponent(searchKeyword)}`,
    );
  };

  const handlePageChange = (newPage: number) => {
    router.push(
      `/console/token?p=${newPage}&keyword=${encodeURIComponent(searchKeyword)}`,
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除该令牌？")) return;
    const res = await deleteToken(id);
    if (res.success) {
      toast.success("删除成功");
      router.refresh();
    } else {
      toast.error(res.message || "删除失败");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch (err) {
      toast.error("复制失败");
    }
  };

  const renderStatus = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-xs font-medium">
            已启用
          </span>
        );
      case 2:
        return (
          <span className="text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium">
            已禁用
          </span>
        );
      case 3:
        return (
          <span className="text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded text-xs font-medium">
            已过期
          </span>
        );
      case 4:
        return (
          <span className="text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded text-xs font-medium">
            已耗尽
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
    return `$${(quota / 500000).toFixed(4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            我的令牌
          </h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 创建令牌
          </Button>
        </div>

        <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
            <div className="relative flex-1 max-w-sm flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="搜索令牌名称或密钥..."
                  className="pl-8"
                  value={searchKeyword}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                />
              </div>
              <Button variant="secondary" onClick={executeSearch}>
                搜索
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>已用额度</TableHead>
                <TableHead>剩余额度</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>过期时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialTokens.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                initialTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{token.name}</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          {showKey[token.id]
                            ? `sk-${token.key}`
                            : `sk-${token.key.substring(0, 4)}***${token.key.substring(token.key.length - 4)}`}
                          <button
                            onClick={() =>
                              setShowKey((prev) => ({
                                ...prev,
                                [token.id]: !prev[token.id],
                              }))
                            }
                            className="hover:text-blue-500"
                          >
                            {showKey[token.id] ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`sk-${token.key}`)}
                            className="hover:text-blue-500"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(token.status)}</TableCell>
                    <TableCell>{renderQuota(token.used_quota)}</TableCell>
                    <TableCell>
                      {token.unlimited_quota ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <span className="text-lg">∞</span> 无限制
                        </span>
                      ) : (
                        renderQuota(token.remain_quota)
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(token.created_time * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {token.expired_time === -1
                        ? "永不过期"
                        : new Date(token.expired_time * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDelete(token.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination simple implementation */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm text-slate-500">共 {total} 条数据</div>
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
