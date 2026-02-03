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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api"; // Helper if used client side, but we use server actions or fetch
import { useRouter } from "next/navigation";
import { Coins, CreditCard, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

// Re-define interfaces or import if shared
interface Log {
  id: number;
  created_at: number;
  type: number;
  quota: number;
  content: string;
}

interface TopupInfo {
  enable_online_topup: boolean;
  enable_stripe_topup: boolean;
  min_topup: number;
  pay_methods: any[]; // Assuming array of objects
  amount_options: number[];
  discount: Record<string, number>;
}

interface TopupClientProps {
  user: any;
  topupInfo: TopupInfo | null;
  initialLogs: Log[];
}

export function TopupClient({
  user,
  topupInfo,
  initialLogs,
}: TopupClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"online" | "code">("code");
  const [redemptionCode, setRedemptionCode] = useState("");
  const [amount, setAmount] = useState<number>(topupInfo?.min_topup || 10); // Default amount
  const [isPending, setIsPending] = useState(false);

  const renderQuota = (quota: number) => {
    return `$${(quota / 500000).toFixed(6)}`;
  };

  const handleRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redemptionCode.trim()) return;

    setIsPending(true);
    try {
      const res = await fetch("/api/user/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: redemptionCode }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("兑换成功");
        setRedemptionCode("");
        router.refresh(); // Refresh to update balance and logs
      } else {
        toast.error(data.message || "兑换失败");
      }
    } catch (err) {
      toast.error("网络错误");
    } finally {
      setIsPending(false);
    }
  };

  const handleOnlinePay = async (paymentMethod: string) => {
    // This is complex. It usually redirects to Epay or Stripe.
    // Flow: POST /api/user/pay (or stripe/pay) -> get redirect URL -> window.location.href
    if (amount < (topupInfo?.min_topup || 1)) {
      toast.error(`最小充值金额为 ${topupInfo?.min_topup || 1}`);
      return;
    }

    setIsPending(true);
    try {
      let url = "/api/user/pay"; // Default Epay
      let body: any = { amount, top_up_code: "" };

      if (paymentMethod === "stripe") {
        url = "/api/user/stripe/pay";
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        // If data has data (url), redirect
        if (data.data) {
          window.location.href = data.data;
        } else {
          toast.success(data.message);
        }
      } else {
        toast.error(data.message || "请求支付失败");
      }
    } catch (e) {
      toast.error("支付请求错误");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">钱包管理</h1>
        <p className="text-muted-foreground">管理您的账户余额和充值记录</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className="p-6 flex flex-col justify-between bg-primary/5 border-primary/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                当前余额
              </p>
              <h2 className="text-3xl font-bold">
                {renderQuota(user?.quota || 0)}
              </h2>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            剩余额度: {user?.quota || 0}
          </div>
        </Card>

        {/* Topup Action Card */}
        <Card className="col-span-1 md:col-span-2 p-6">
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            {topupInfo?.enable_online_topup && (
              <button
                onClick={() => setActiveTab("online")}
                className={cn(
                  "text-sm font-medium px-4 py-2 rounded-md transition-colors",
                  activeTab === "online"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                在线充值
              </button>
            )}
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-md transition-colors",
                activeTab === "code"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              兑换码充值
            </button>
          </div>

          {activeTab === "code" && (
            <form onSubmit={handleRedemption} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="code">兑换码</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="请输入您的兑换码"
                    value={redemptionCode}
                    onChange={(e) => setRedemptionCode(e.target.value)}
                  />
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "兑换中..." : "兑换"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                输入您获得的兑换码以增加账户额度。
              </p>
            </form>
          )}

          {activeTab === "online" && topupInfo && (
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>充值金额 ($)</Label>
                <Input
                  type="number"
                  min={topupInfo.min_topup}
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  当前汇率等请参考充值页面说明。最小充值: {topupInfo.min_topup}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {/* Render button for generic Epay */}
                {topupInfo.enable_online_topup && (
                  <Button
                    onClick={() => handleOnlinePay("epay")}
                    disabled={isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    在线支付
                  </Button>
                )}
                {/* Render button for Stripe if separate */}
                {topupInfo.enable_stripe_topup && (
                  <Button
                    variant="outline"
                    onClick={() => handleOnlinePay("stripe")}
                    disabled={isPending}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Stripe 支付
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">充值/消费记录 (最近10条)</h3>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>额度变动</TableHead>
                <TableHead>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    暂无记录
                  </TableCell>
                </TableRow>
              ) : (
                initialLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        {log.type === 1 ? "充值" : "消费"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono">
                      {renderQuota(log.quota)}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={log.content}
                    >
                      {log.content}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
