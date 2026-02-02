"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  History,
  CreditCard,
  Gift,
  Settings,
  Users,
  Layers,
  Monitor,
  Terminal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";

const sidebarLinks = [
  {
    group: "工作台",
    items: [
      { name: "数据看板", href: "/console", icon: LayoutDashboard },
      { name: "令牌管理", href: "/console/token", icon: Key },
      { name: "使用日志", href: "/console/log", icon: History },
    ],
  },
  {
    group: "财务管理",
    items: [
      { name: "额度充值", href: "/console/topup", icon: CreditCard },
      { name: "兑换中心", href: "/console/redemption", icon: Gift },
      { name: "费率说明", href: "/console/pricing", icon: TrendingUp },
    ],
  },
  {
    group: "更多",
    items: [
      { name: "个人设置", href: "/console/settings", icon: Settings },
      { name: "预览体验", href: "/console/playground", icon: Terminal },
    ],
  },
];

const adminLinks = [
  {
    group: "系统管理",
    items: [
      { name: "渠道管理", href: "/console/channel", icon: Layers },
      { name: "用户管理", href: "/console/user", icon: Users },
      { name: "节点监控", href: "/console/monitor", icon: Monitor },
      { name: "系统设置", href: "/console/system", icon: Settings },
    ],
  },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin (simplified)
    const userInfoStr = localStorage.getItem("user_info");
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setIsAdmin(userInfo.role >= 10); // Role 10 is admin in original
    }
  }, []);

  const links = isAdmin ? [...sidebarLinks, ...adminLinks] : sidebarLinks;

  return (
    <aside
      className={cn(
        "h-[calc(100vh-64px)] fixed left-0 top-16 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 transition-all duration-300 z-40 overflow-y-auto",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full py-6 px-4">
        {links.map((group, idx) => (
          <div key={idx} className="mb-8 last:mb-0">
            {!isCollapsed && (
              <h5 className="px-4 mb-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.group}
              </h5>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group no-underline",
                    pathname === item.href
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "transition-transform group-hover:scale-110",
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400",
                    )}
                  />
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-auto pt-6">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
