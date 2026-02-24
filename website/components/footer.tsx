'use client'

import { Github, Globe, Mail } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t pt-16 pb-8 px-6 overflow-hidden relative">
      <div className="container mx-auto ">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 mb-6 group no-underline"
            >
              <Image src="/icon.png" alt="Broadscene" width={32} height={32} className="rounded-md" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Broadscene
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              下一代大模型 API 服务平台，提供统一、稳定、高效的接口接入能力，
              助力开发者和企业快速构建 AI 应用。
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/nps-z/new-api"
                target="_blank"
                className="p-2 bg-background border rounded-lg text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={18} />
              </Link>
              <Link
                href="mailto:support@example.com"
                className="p-2 bg-background border rounded-lg text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">产品</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  价格方案
                </Link>
              </li>
              <li>
                <Link
                  href="/models"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  支持模型
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.newapi.pro"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  接口文档
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">资源</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  登录
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  注册
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/nps-z/new-api/issues"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  反馈建议
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6">法律</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link
                  href="https://docs.newapi.pro"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  使用文档
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/nps-z/new-api"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary no-underline transition-colors"
                >
                  开源仓库
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            ©
            {' '}
            {currentYear}
            {' '}
            Broadscene. 保留所有权利。
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe size={14} />
              简体中文
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
