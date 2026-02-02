"use client";

import Link from "next/link";
import { Zap, Github, Mail, Globe, Shield, FileText } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 pt-16 pb-8 px-6 overflow-hidden relative">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-6 group no-underline"
            >
              <div className="p-1.5 rounded-lg bg-blue-600 text-white group-hover:scale-110 transition-transform">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                New API
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              下一代大模型中转管理系统，提供统一、稳定、高效的 API
              集成解决方案。助力开发者和企业快速接入顶尖 AI 性能。
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/nps-z/new-api"
                target="_blank"
                className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
              >
                <Github size={18} />
              </Link>
              <Link
                href="mailto:support@example.com"
                className="p-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              产品
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  价格方案
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  支持模型
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.newapi.pro"
                  target="_blank"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  接口文档
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              资源
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/about"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  服务状态
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/nps-z/new-api/issues"
                  target="_blank"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors"
                >
                  反馈建议
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">
              法律
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors flex items-center gap-2"
                >
                  <Shield size={14} />
                  用户协议
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 no-underline transition-colors flex items-center gap-2"
                >
                  <FileText size={14} />
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 dark:text-slate-500 text-xs">
            © {currentYear} New API Project. 保留所有权利。
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Globe size={14} />
              简体中文
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
