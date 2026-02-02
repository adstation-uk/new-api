"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Zap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Key,
  History,
  CreditCard,
  Gift,
  Globe,
  Github,
} from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Sync with iron-session

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Check login status (simplified for now, should check cookie or call API)
    const hasSession = document.cookie.includes("session");
    setIsLoggedIn(hasSession);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "首页", href: "/" },
    { name: "价格", href: "/pricing" },
  ];

  const consoleLinks = [
    { name: "总览", href: "/console", icon: LayoutDashboard },
    { name: "令牌", href: "/console/token", icon: Key },
    { name: "日志", href: "/console/log", icon: History },
    { name: "充值", href: "/console/topup", icon: CreditCard },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || isMobileMenuOpen
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group no-underline">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white group-hover:scale-110 transition-transform">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              New API
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 no-underline",
                  pathname === link.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn && (
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
            )}

            {isLoggedIn &&
              consoleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 no-underline flex items-center gap-1.5",
                    pathname === link.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400",
                  )}
                >
                  <link.icon size={14} />
                  {link.name}
                </Link>
              ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" className="gap-2" asChild>
                  <Link href="/console/settings" className="no-underline">
                    <User size={16} />
                    个人中心
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  asChild
                >
                  <Link href="/api/user/logout" className="no-underline">
                    退出登录
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" className="no-underline">
                    登录
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  asChild
                >
                  <Link href="/register" className="no-underline px-6">
                    注册
                  </Link>
                </Button>
              </>
            )}

            <Link
              href="https://github.com/nps-z/new-api"
              target="_blank"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Github size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 p-6 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-lg font-medium py-2 no-underline",
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-slate-600 dark:text-slate-400",
                )}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn && (
              <div className="h-[1px] bg-slate-100 dark:bg-white/10 my-2" />
            )}

            {isLoggedIn &&
              consoleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium py-2 no-underline flex items-center gap-3",
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-slate-600 dark:text-slate-400",
                  )}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {isLoggedIn ? (
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  asChild
                >
                  <Link href="/api/user/logout">登出</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">登录</Link>
                  </Button>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href="/register">注册</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
