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
import { Copy, Eye, EyeOff, Plus, Search, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { deleteToken, createToken } from "./actions";
import { Label } from "@/components/ui/label";

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

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExpire, setNewExpire] = useState(""); // YYYY-MM-DD
  const [newQuota, setNewQuota] = useState("500000"); // Default $1
  const [isUnlimited, setIsUnlimited] = useState(true);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // Prepare FormData
    const formData = new FormData();
    formData.append("name", newName);

    // Convert date to timestamp if needed, or let server handle.
    // However, clean logic:
    // If unlimited quota => quota is not sent or ignored by server usually?
    // Usually API behavior:
    // unlimited_quota: true/false.
    // If false, remain_quota is required.

    formData.append("unlimited_quota", isUnlimited.toString());

    if (!isUnlimited) {
      formData.append("remain_quota", newQuota);
    } else {
      formData.append("remain_quota", "0");
    }

    if (newExpire) {
      // Convert YYYY-MM-DD to timestamp (seconds)
      // Add end of day time usually? Or just midnight.
      const ts = Math.floor(new Date(newExpire).getTime() / 1000);
      formData.append("expire_time", ts.toString());
    } else {
      // If empty and not unlimited, what does it mean? Usually never expire.
      // Default -1
      formData.append("expire_time", "-1");
    }

    const res = await createToken(null, formData);
    setIsPending(false);

    if (res.success) {
      toast.success("创建成功");
      setIsCreateOpen(false);
      setNewName("");
      setNewQuota("500000");
      setNewExpire("");
      setIsUnlimited(true);
      router.refresh();
    } else {
      toast.error(res.message || "创建失败");
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
          <h1 className="text-3xl font-bold tracking-tight">我的令牌</h1>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 创建令牌
          </Button>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b flex gap-4">
            <div className="relative flex-1 max-w-sm flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                    className="text-center py-8 text-muted-foreground"
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
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                            className="hover:text-primary transition-colors"
                          >
                            {showKey[token.id] ? (
                              <EyeOff size={12} />
                            ) : (
                              <Eye size={12} />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(`sk-${token.key}`)}
                            className="hover:text-primary transition-colors"
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
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="text-lg">∞</span> 无限制
                        </span>
                      ) : (
                        renderQuota(token.remain_quota)
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(token.created_time * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
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
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Create Token Modal Overlay */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-card shadow-lg border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">创建新令牌</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  placeholder="请输入令牌名称"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expire">过期时间</Label>
                <div className="relative">
                  <Input
                    id="expire"
                    type="date"
                    value={newExpire}
                    onChange={(e) => setNewExpire(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    留空表示永不过期
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>额度限制</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="unlimited"
                      checked={isUnlimited}
                      onChange={(e) => setIsUnlimited(e.target.checked)}
                      className="h-4 w-4 rounded border-input bg-background"
                    />
                    <label
                      htmlFor="unlimited"
                      className="text-sm font-medium leading-none"
                    >
                      无限额度
                    </label>
                  </div>
                </div>

                {!isUnlimited && (
                  <Input
                    type="number"
                    min="0"
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    placeholder="请输入额度 ($1 = 500000)"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isPending}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "创建中..." : "提交"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
