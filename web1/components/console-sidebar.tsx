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
  Activity,
  MessageSquare,
  Ticket,
  Sliders,
  Server,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const DEFAULT_ADMIN_CONFIG: any = {
  chat: { enabled: true, playground: true, chat: true },
  console: {
    enabled: true,
    detail: true,
    token: true,
    log: true,
    midjourney: true,
    task: true,
  },
  personal: { enabled: true, topup: true, personal: true },
  admin: {
    enabled: true,
    channel: true,
    models: true,
    deployment: true,
    redemption: true,
    user: true,
    setting: true,
  },
};

export function ConsoleSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, userRes] = await Promise.all([
          fetch("/api/status"),
          fetch("/api/user/self"),
        ]);
        const statusJson = await statusRes.json();
        const userJson = await userRes.json();
        if (statusJson.success) setStatus(statusJson.data);
        if (userJson.success) setUser(userJson.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const adminConfig = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_ADMIN_CONFIG));
    if (status?.SidebarModulesAdmin) {
      try {
        const customAdmin = JSON.parse(status.SidebarModulesAdmin);
        for (const [k, v] of Object.entries(customAdmin)) {
          if (merged[k]) Object.assign(merged[k], v);
        }
      } catch (e) {}
    }
    return merged;
  }, [status]);

  const userConfig = useMemo(() => {
    if (!user?.sidebar_modules) return null;
    try {
      return typeof user.sidebar_modules === "string"
        ? JSON.parse(user.sidebar_modules)
        : user.sidebar_modules;
    } catch (e) {
      return null;
    }
  }, [user]);

  const isModuleVisible = (section: string, module: string) => {
    const adminSection = adminConfig[section];
    if (!adminSection?.enabled) return false;

    // Check if admin explicitly disabled this module
    if (adminSection[module] === false) return false;

    // Check user config if exists
    if (userConfig && userConfig[section]) {
      if (userConfig[section].enabled === false) return false;
      if (userConfig[section][module] === false) return false;
    }

    return true;
  };

  const isAdmin = user?.role >= 10;

  const sidebarLinks = useMemo(() => {
    const groups: { group: string; items: any[] }[] = [];

    // Group 0: Experience (Playground/Chat)
    const experienceItems = [
      {
        name: "操练场",
        href: "/console/playground",
        icon: Terminal,
        section: "chat",
        module: "playground",
      },
      {
        name: "聊天",
        href: "/console/chat",
        icon: MessageSquare,
        section: "chat",
        module: "chat",
      },
    ].filter((item) => isModuleVisible(item.section, item.module));

    if (experienceItems.length > 0) {
      groups.push({ group: "预览体验", items: experienceItems });
    }

    // Group 1: Workspace
    const workspaceItems = [
      {
        name: "数据看板",
        href: "/console",
        icon: LayoutDashboard,
        section: "console",
        module: "detail",
      },
      {
        name: "令牌管理",
        href: "/console/token",
        icon: Key,
        section: "console",
        module: "token",
      },
      {
        name: "使用日志",
        href: "/console/log",
        icon: History,
        section: "console",
        module: "log",
      },
      {
        name: "绘图日志",
        href: "/console/midjourney",
        icon: Layers,
        section: "console",
        module: "midjourney",
      },
      {
        name: "任务日志",
        href: "/console/task",
        icon: Activity,
        section: "console",
        module: "task",
      },
    ].filter((item) => isModuleVisible(item.section, item.module));

    if (workspaceItems.length > 0) {
      groups.push({ group: "工作台", items: workspaceItems });
    }

    // Group 2: Personal
    const personalItems = [
      {
        name: "钱包管理",
        href: "/console/topup",
        icon: CreditCard,
        section: "personal",
        module: "topup",
      },
      {
        name: "充值中心",
        href: "/console/recharge",
        icon: Gift,
        section: "personal",
        module: "topup",
      },
      {
        name: "个人设置",
        href: "/console/personal",
        icon: Settings,
        section: "personal",
        module: "personal",
      },
      {
        name: "费率说明",
        href: "/pricing",
        icon: TrendingUp,
        section: "personal",
        module: "personal",
      },
    ].filter((item) => isModuleVisible(item.section, item.module));

    if (personalItems.length > 0) {
      groups.push({ group: "个人中心", items: personalItems });
    }

    // Admin Group
    if (isAdmin) {
      const adminItems = [
        {
          name: "渠道管理",
          href: "/console/admin/channel",
          icon: Database,
          section: "admin",
          module: "channel",
        },
        {
          name: "模型管理",
          href: "/console/admin/models",
          icon: Layers,
          section: "admin",
          module: "models",
        },
        {
          name: "节点部署",
          href: "/console/admin/deployment",
          icon: Server,
          section: "admin",
          module: "deployment",
        },
        {
          name: "兑换管理",
          href: "/console/admin/redemption",
          icon: Ticket,
          section: "admin",
          module: "redemption",
        },
        {
          name: "用户管理",
          href: "/console/admin/user",
          icon: Users,
          section: "admin",
          module: "user",
        },
        {
          name: "系统属性",
          href: "/console/admin/setting",
          icon: Sliders,
          section: "admin",
          module: "setting",
        },
      ].filter((item) => isModuleVisible(item.section, item.module));

      if (adminItems.length > 0) {
        groups.push({ group: "系统管理", items: adminItems });
      }
    }

    return groups;
  }, [adminConfig, userConfig, isAdmin]);

  return (
    <aside
      className={cn(
        "h-[calc(100vh-64px)] fixed left-0 top-16 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 transition-all duration-300 z-40 overflow-y-auto",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full py-6 px-4">
        {sidebarLinks.map((group, idx) => (
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
