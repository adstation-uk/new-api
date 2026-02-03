"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Github,
  Key,
  Lock,
  Smartphone,
  Copy,
  RefreshCw,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface UserState {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number;
  group: string;
  quota: number;
  github_id: string;
  wechat_id: string;
  telegram_id: string;
  linux_do_id: string; // adjust field names if needed
}

interface StatusState {
  github_oauth: boolean;
  wechat_login: boolean;
  email_verification: boolean;
  turnstile_check: boolean;
  turnstile_site_key: string;
}

interface PersonalClientProps {
  user: UserState;
  status: StatusState;
}

export function PersonalClient({ user, status }: PersonalClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/token");
      const data = await res.json();
      if (data.success) {
        setAccessToken(data.data);
        toast.success("访问令牌已生成");
      } else {
        toast.error(data.message || "生成失败");
      }
    } catch (e) {
      toast.error("网络错误");
    } finally {
      setLoading(false);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/user/logout");
      window.location.href = "/login";
    } catch (e) {
      toast.error("注销失败");
    }
  };

  // Helper to render role
  const getRoleLabel = (role: number) => {
    switch (role) {
      case 1:
        return "普通用户";
      case 10:
        return "管理员";
      case 100:
        return "超级管理员";
      default:
        return "未知";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            个人设置
          </h1>
          <p className="text-muted-foreground mt-1">
            管理您的个人资料和账户安全
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> 退出登录
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>您的公开个人资料信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user.username}.png`}
                />
                <AvatarFallback>
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {user.display_name || user.username}
                </h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                  <Badge variant="outline">{user.group}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>用户 ID</Label>
                <Input value={user.id.toString()} disabled />
              </div>
              <div className="grid gap-2">
                <Label>用户名</Label>
                <Input value={user.username} disabled />
              </div>
              <div className="grid gap-2">
                <Label>当前余额</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`$${(user.quota / 500000).toFixed(6)}`}
                    disabled
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/console/topup")}
                  >
                    充值
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>账户安全 & 访问</CardTitle>
            <CardDescription>管理您的账户绑定和访问令牌</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                账号绑定
              </h4>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">邮箱</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email || "未绑定"}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled>
                  {user.email ? "已绑定" : "去绑定"}
                </Button>
              </div>

              {status.github_oauth && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-slate-900 dark:text-white" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">GitHub</span>
                      <span className="text-xs text-muted-foreground">
                        {user.github_id ? "已绑定" : "未绑定"}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled={!!user.github_id}>
                    {user.github_id ? "已绑定" : "绑定"}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  访问令牌 (Access Token)
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateToken}
                  disabled={loading}
                >
                  <RefreshCw
                    className={cn("h-4 w-4 mr-1", loading && "animate-spin")}
                  />
                  {accessToken ? "重新生成" : "生成"}
                </Button>
              </div>
              {accessToken ? (
                <div className="relative">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-xs break-all pr-10">
                    {accessToken}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => copyToClipboard(accessToken)}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                  点击生成获取用于 OpenAI 客户端连接的系统级令牌
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t">
            <div className="w-full flex gap-2">
              <Button variant="outline" className="w-full">
                修改密码
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-700"
              >
                删除账号
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Utility to combine class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
