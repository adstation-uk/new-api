"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Key,
  History,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/lib/user";
import { logout } from "@/app/actions/auth";

const consoleLinks = [
  { name: "总览", href: "/console", icon: LayoutDashboard },
  { name: "令牌", href: "/console/token", icon: Key },
  { name: "日志", href: "/console/log", icon: History },
  { name: "充值", href: "/console/topup", icon: CreditCard },
];

interface MobileNavProps {
  navLinks: { name: string; href: string }[];
  user: UserInfo | null;
}

export function MobileNav({ navLinks, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto p-6 pb-32 animate-in slide-in-from-top-4 md:hidden bg-background border-b">
          <nav className="relative grid gap-6 text-lg font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex w-full items-center py-2 no-underline hover:text-primary",
                  pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <>
                <div className="h-px bg-border my-2" />
                {consoleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex w-full items-center gap-3 py-2 no-underline hover:text-primary",
                      pathname === link.href
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 py-2 text-destructive no-underline"
                >
                  <LogOut className="h-5 w-5" />
                  退出登录
                </button>
              </>
            )}

            {!user && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    登录
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    注册
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
