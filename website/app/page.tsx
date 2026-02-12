import {
  Claude,
  DeepSeek,
  Gemini,
  Midjourney,
  Moonshot,
  OpenAI,
  Qwen,
  Suno,
  XAI,
  Zhipu,
} from '@lobehub/icons'
import { ArrowRight, Coins, Gift, Shield, Unlock, Zap } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { Footer } from '@/components/footer'
import { HeroSubtitle, HeroTitle } from '@/components/hero-content'
import Marquee from '@/components/magicui/marquee'
import { ServerAddressClient } from '@/components/server-address-client'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const HERO_MODELS_DATA = [
  {
    name: 'Suno music',
    price: '$0.075',
    original: '$0.12',
    discount: '-37.5% OFF',
    unit: '/req',
    icon: (size: number) => <Suno size={size} />,
    pos: '-translate-x-32 -translate-y-36 rotate-[-6deg]',
  },
  {
    name: 'Gemini 3 Pro',
    price: '$9.0',
    original: '$12.0',
    discount: 'BEST VALUE',
    unit: '/M',
    icon: (size: number) => <Gemini.Color size={size} />,
    pos: 'translate-x-4 -translate-y-8',
    featured: true,
  },
  {
    name: 'GPT-5',
    price: '$7.5',
    original: '$10',
    discount: '-25% OFF',
    unit: '/M',
    icon: (size: number) => <OpenAI size={size} />,
    pos: 'translate-x-40 -translate-y-44 rotate-[4deg]',
  },
  {
    name: 'Veo 3.1',
    price: '$3.0',
    original: '$4.38',
    discount: '-31% OFF',
    unit: '/req',
    icon: (size: number) => <Gemini size={size} />,
    pos: '-translate-x-20 translate-y-32 rotate-[-2deg]',
  },
  {
    name: 'Gemini 2.5 Flash',
    price: '$1.8',
    original: '$2.5',
    discount: '-28% OFF',
    unit: '/M',
    icon: (size: number) => <Gemini.Color size={size} />,
    pos: 'translate-x-40 translate-y-24 rotate-[5deg]',
  },
]

const MODEL_GROUPS_ITEMS = [
  { name: 'OpenAI', icon: <OpenAI size={24} />, desc: 'GPT-4o, GPT-5' },
  {
    name: 'Anthropic',
    icon: <Claude.Color size={24} />,
    desc: 'Claude 3.5 Sonnet',
  },
  { name: 'Google', icon: <Gemini.Color size={24} />, desc: 'Gemini 3 Pro' },
  { name: 'Moonshot', icon: <Moonshot size={24} />, desc: 'Kimi-latest' },
  { name: 'Zhipu', icon: <Zhipu size={24} />, desc: 'GLM-4 Plus' },
  { name: 'DeepSeek', icon: <DeepSeek.Color size={24} />, desc: 'DeepSeek V3' },
  { name: 'Midjourney', icon: <Midjourney size={24} />, desc: 'Image Gen V6' },
  { name: 'X.AI', icon: <XAI size={24} />, desc: 'Grok-2' },
  { name: 'Aliyun', icon: <Qwen.Color size={24} />, desc: 'Qwen 2.5' },
  { name: 'Suno', icon: <Suno size={24} />, desc: 'Suno V3.5' },
]

const MODEL_SCROLL_DATA = [
  { name: 'GPT-4o', discount: '80% OFF' },
  { name: 'Claude 3.5 Sonnet', discount: 'NEW' },
  { name: 'Gemini 3 Pro', discount: 'TOP' },
  { name: 'DeepSeek V3', discount: 'VALUE' },
  { name: 'Midjourney V6', discount: 'PRO' },
  { name: 'Suno V3.5', discount: 'HOT' },
  { name: 'Kimi-latest', discount: 'FAST' },
  { name: 'Grok-2', discount: 'X' },
]

export default async function HomePage() {
  let homeContent = ''
  try {
    const res = await api('/api/home_page_content')
    const json = await res.json()
    if (json.success) {
      homeContent = json.data
    }
  }
  catch {}

  const advantages = [
    {
      title: '价格更低',
      desc: '相比官方定价，我们的价格更具竞争力，为您节省每一分钱。',
      icon: <Coins size={32} className="text-primary" />,
    },
    {
      title: '服务稳定',
      desc: '高可用架构设计，确保服务全天候在线，随时响应您的请求。',
      icon: <Shield size={32} className="text-primary" />,
    },
    {
      title: '无限制',
      desc: '没有繁琐的请求限制，释放您的创造力，尽情探索 AI 的可能性。',
      icon: <Unlock size={32} className="text-primary" />,
    },
  ]

  return (
    <div className="w-full overflow-x-hidden">
      {/* Banner 部分 */}
      <div className="w-full lg:min-h-[calc(100vh-64px)] relative overflow-hidden flex flex-col justify-center bg-background">
        <div className="container mx-auto px-6 z-10 text-foreground h-full flex items-center">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
            {/* 左侧内容区 */}
            <div className="flex flex-col items-start text-left max-w-2xl w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap size={14} />
                <span>下一代 API 网关</span>
              </div>
              <HeroTitle />
              <HeroSubtitle />

              {/* BASE URL */}
              <ServerAddressClient />

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  href="/console"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-10 h-14 text-lg font-bold text-primary-foreground bg-primary hover:scale-105 transition-transform cursor-pointer no-underline"
                >
                  <span>立即免费开始</span>
                  <ArrowRight size={20} />
                </Link>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 text-sm font-medium text-destructive animate-pulse">
                    <Gift size={16} />
                    <span>注册即送 $1</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 text-sm font-medium text-primary">
                    <Zap size={14} className="fill-current" />
                    <span>全场模型 75 折起</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧展示区 - 错落卡片 */}
            <div className="relative lg:w-1/2 w-full hidden md:flex justify-center items-center h-[600px]">
              {HERO_MODELS_DATA.map(item => (
                <div
                  key={item.name}
                  className={cn(
                    'absolute transform transition-all hover:scale-105 hover:z-50',
                    item.pos,
                    item.featured ? 'z-30' : 'z-20',
                  )}
                >
                  <div
                    className={cn(
                      'p-8 rounded-2xl border shadow-xl bg-card text-card-foreground',
                      item.featured && 'ring-2 ring-primary border-primary',
                    )}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      {item.icon(item.featured ? 48 : 40)}
                      <span className="font-bold tracking-tight text-xl uppercase">
                        {item.name}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black">
                          {item.price}
                          <span className="text-lg font-normal text-muted-foreground">
                            {item.unit || '/M'}
                          </span>
                        </span>
                        <span className="text-sm line-through text-muted-foreground/50">
                          {item.original}
                          {item.unit || '/M'}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest',
                          item.featured
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted text-muted-foreground border-border',
                        )}
                      >
                        {item.discount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 优势部分 */}
      <div className="w-full bg-background border-b relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              优势
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-xl text-muted-foreground">为什么选择我们</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map(adv => (
              <div
                key={adv.title}
                className="p-8 rounded-2xl bg-card border transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
              >
                <div className="mb-6 p-4 rounded-full bg-muted w-fit group-hover:scale-110 transition-transform hidden md:block relative z-10">
                  {adv.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground relative z-10">
                  {adv.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
                  {adv.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t">
            <p className="text-center text-muted-foreground mb-10 font-medium tracking-widest uppercase text-sm">
              支持全球主流大模型
            </p>
            <div className="space-y-6">
              <Marquee pauseOnHover className="[--duration:50s]">
                {MODEL_GROUPS_ITEMS.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-6 py-3 bg-muted/50 border rounded-2xl whitespace-nowrap"
                  >
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:50s]">
                {MODEL_GROUPS_ITEMS.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 px-6 py-3 bg-muted/50 border rounded-2xl whitespace-nowrap"
                  >
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </div>

      {/* 滚动条部分 */}
      <div className="w-full py-4 bg-muted/50 border-b overflow-hidden relative">
        <Marquee pauseOnHover className="[--duration:40s]">
          {MODEL_SCROLL_DATA.map(item => (
            <div
              key={item.name}
              className="flex items-center gap-4 px-8 py-4 bg-card rounded-2xl mx-4 border shadow-sm"
            >
              <span className="font-bold text-foreground">{item.name}</span>
              <span className="px-2 py-0.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                {item.discount}
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* 自定义公告/内容 */}
      {homeContent && (
        <div className="w-full bg-background py-16 border-b">
          <div className="container mx-auto px-6">
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
              dangerouslySetInnerHTML={{ __html: homeContent }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
