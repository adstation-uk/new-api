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
import {
  ArrowRight,
  Coins,
  FileText,
  Lock,
  Plus,
  Rocket,
  Scale,
  Shield,
  Timer,
  Zap,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/footer'
import { DotPattern } from '@/components/magicui/dot-pattern'
import Marquee from '@/components/magicui/marquee'
import { ShineBorder } from '@/components/magicui/shine-border'
import { ServerAddressClient } from '@/components/server-address-client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { api } from '@/lib/api'
import { getOptionalUserInfo } from '@/lib/user'

const MODEL_GROUPS_ITEMS = [
  { name: 'OpenAI', icon: <OpenAI size={22} />, desc: 'GPT-4o / GPT-5 / o3' },
  {
    name: 'Anthropic',
    icon: <Claude.Color size={22} />,
    desc: 'Claude 3.5 Sonnet',
  },
  { name: 'Google', icon: <Gemini.Color size={22} />, desc: 'Veo / Gemini / Imagen' },
  { name: 'Moonshot', icon: <Moonshot size={22} />, desc: 'Kimi-latest' },
  { name: 'Zhipu', icon: <Zhipu size={22} />, desc: 'GLM-4 Plus' },
  { name: 'DeepSeek', icon: <DeepSeek.Color size={22} />, desc: 'DeepSeek V3' },
  { name: 'Midjourney', icon: <Midjourney size={22} />, desc: 'Image Gen V6' },
  { name: 'X.AI', icon: <XAI size={22} />, desc: 'Grok-2' },
  { name: 'Aliyun', icon: <Qwen.Color size={22} />, desc: 'Qwen 2.5' },
  { name: 'Suno', icon: <Suno size={22} />, desc: 'Suno V4.5' },
]

const HERO_METRICS = [
  { label: '正常运行时间', value: '99.9%+', icon: <Shield className="size-4" /> },
  { label: '平均响应', value: '24.7s', icon: <Timer className="size-4" /> },
  { label: '支持服务', value: '24/7', icon: <Rocket className="size-4" /> },
  { label: '数据安全', value: '#1', icon: <Lock className="size-4" /> },
]

const API_USE_CASES = [
  {
    title: 'AI视频生成API',
    desc: '通过 Veo 3.1、Veo 3.1 Fast 和 Runway Aleph 创建高质量视频，支持同步音频、流畅动态与更强镜头控制。',
  },
  {
    title: 'AI图像生成API',
    desc: '使用 4o Image API、Flux Kontext API 和 Nano Banana API 生成高质量图像，兼顾真实感、风格控制与一致性。',
  },
  {
    title: 'AI音乐生成API',
    desc: '通过 Suno API 生成高质量音乐，支持更强人声、优化编曲与长时长创作，适合应用、游戏和创意工作流。',
  },
  {
    title: 'LLM与AI聊天API',
    desc: '通过单一 API 密钥接入先进 LLM，支持对话、编码与知识问答，快速构建更智能的用户体验。',
  },
]

const WHY_ITEMS = [
  {
    title: '灵活的信用系统，经济实惠的AI API定价',
    desc: '按使用付费，降低初创团队和企业项目的接入成本。',
    icon: <Coins className="size-5 text-primary" />,
  },
  {
    title: '免费试用AI API沙盒',
    desc: '在集成前即可测试提示词与参数，无需先购买计划。',
    icon: <Zap className="size-5 text-primary" />,
  },
  {
    title: '简单的AI API集成',
    desc: '提供文档与示例，几分钟即可将 AI 能力集成进产品。',
    icon: <FileText className="size-5 text-primary" />,
  },
  {
    title: '快速且可扩展的AI API表现',
    desc: '低延迟、高并发、稳定输出，覆盖从原型到生产的全阶段。',
    icon: <Rocket className="size-5 text-primary" />,
  },
  {
    title: '强大的数据安全性',
    desc: '全链路安全设计与加密机制，保障业务与数据隐私。',
    icon: <Shield className="size-5 text-primary" />,
  },
  {
    title: '全天候监控与客户支持',
    desc: '提供 24/7 监控与支持，帮助业务连续稳定运行。',
    icon: <Scale className="size-5 text-primary" />,
  },
]

const HOT_MODELS = [
  { name: 'Google Veo 3.1', type: '视频创作', desc: '电影级动态与原生同步音频输出。' },
  { name: 'Runway Aleph', type: '视频创作', desc: '多任务视频编辑与更强场景理解。' },
  { name: 'Suno API', type: '音乐生成', desc: '真实歌声与多风格高质量音乐生成。' },
  { name: '4o Image API', type: '图像创作', desc: '高保真视觉与准确文本渲染能力。' },
  { name: 'Flux.1 Kontext', type: '图像创作', desc: '高一致性输出，适合细节密集场景。' },
  { name: 'Nano Banana', type: '图像编辑', desc: '快速精准图像生成与编辑体验。' },
]

const FAQ_ITEMS = [
  {
    q: '什么是 Kie.ai，它是如何工作的？',
    a: 'Kie.ai 是一个 AI 平台，提供视频、图像、音乐和聊天 API。开发者可通过统一密钥接入不同模型能力。',
  },
  {
    q: 'Kie.ai 是否为新用户提供免费试用？',
    a: '是的，平台提供免费试用，便于在正式付费前进行功能验证。',
  },
  {
    q: 'Kie.ai 的定价模式是什么？',
    a: '采用灵活积分/按量模式，适配不同规模与不同阶段的业务。',
  },
  {
    q: 'Kie.ai 提供哪些 AI API？',
    a: '覆盖视频、图像、音乐与聊天能力，持续接入新的主流模型。',
  },
  {
    q: 'Kie.ai 是否提供 API 文档？',
    a: '提供完整文档与示例，涵盖配置、调用、最佳实践与排错建议。',
  },
  {
    q: '如何将 Kie.ai API 集成到项目中？',
    a: '注册账号后获取 API 密钥，再按文档完成配置即可开始调用。',
  },
]

export default async function HomePage() {
  const user = await getOptionalUserInfo()
  const t = await getTranslations('ProfilePage')

  let homeContent = ''
  try {
    const res = await api('/api/home_page_content')
    const json = await res.json()
    if (json.success) {
      homeContent = json.data
    }
  }
  catch {}

  return (
    <div className="w-full overflow-x-hidden bg-background">
      <section className="relative overflow-hidden border-b">
        <DotPattern
          width={22}
          height={22}
          className="mask-[radial-gradient(760px_circle_at_center,white,transparent)] opacity-35"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)/0.2),transparent_40%),radial-gradient(circle_at_90%_20%,hsl(var(--primary)/0.14),transparent_45%)]" />

        <div className="container relative z-10 mx-auto px-6 py-8 md:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl space-y-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                一站式访问最佳的视频、图像和音乐模型
              </Badge>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                {t('title', { username: user?.username ?? 'Guest' })}
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                成本低于同类平台，运行速度更快，开发者体验更友好。您可以直接用现有 OpenAI 风格调用方式快速接入多模型能力。
              </p>

              <div>
                <ServerAddressClient />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-11 rounded-xl px-6">
                  <Link href="/console" className="no-underline">
                    立即获取免费 API 密钥
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-11 rounded-xl px-6">
                  <Link href="https://docs.newapi.pro" target="_blank" className="no-underline">
                    API 文档
                  </Link>
                </Button>
              </div>

              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {HERO_METRICS.map(item => (
                  <div key={item.label} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                    {item.icon}
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-none">
              <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
              <CardHeader>
                <CardTitle>热门接入模型</CardTitle>
                <CardDescription>一个密钥，统一访问多家模型生态</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {MODEL_GROUPS_ITEMS.map(item => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/models" className="no-underline">浏览全部模型</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">适合任何项目的 AI API</h2>
            <p className="mt-4 text-muted-foreground">参考 Kie.ai 首页结构，采用清晰的能力分区与转化路径。</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {API_USE_CASES.map((item, index) => (
              <Card key={item.title} className="relative overflow-hidden rounded-2xl">
                {index === 0 && <ShineBorder shineColor={['#ffaa40', '#9c40ff']} duration={10} />}
                <CardHeader>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription className="leading-7">{item.desc}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/console" className="no-underline">立即获取 API 密钥</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">为什么选择 Kie.ai 进行 API 集成</h2>
            <p className="mt-4 text-muted-foreground">延续你要求的参考风格与文案，后续你可再替换为 New API 自有内容。</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map(item => (
              <Card key={item.title} className="rounded-2xl border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-lg">
                    <span className="mt-0.5">{item.icon}</span>
                    <span>{item.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-6">{item.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">您今天可以访问的热门 AI 模型</h2>
          </div>

          <Marquee pauseOnHover className="mb-8 [--duration:55s]">
            {MODEL_GROUPS_ITEMS.map(item => (
              <div key={item.name} className="flex items-center gap-2 rounded-xl border bg-card px-5 py-3 whitespace-nowrap">
                {item.icon}
                <span className="font-medium">{item.name}</span>
                <Badge variant="outline">{item.desc}</Badge>
              </div>
            ))}
          </Marquee>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {HOT_MODELS.map(item => (
              <Card key={item.name} className="rounded-2xl">
                <CardHeader>
                  <CardDescription>{item.type}</CardDescription>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/models" className="no-underline">探索全部</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Kie.ai 常见问题</h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4">
            {FAQ_ITEMS.map(item => (
              <Card key={item.q} className="rounded-xl">
                <CardContent className="p-0">
                  <details className="group p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold marker:content-none">
                      {item.q}
                      <Plus className="size-5 transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-16">
          <Card className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
            <ShineBorder shineColor="#ffffff" duration={8} />
            <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center md:px-12">
              <h2 className="text-3xl font-bold md:text-5xl">立即开始使用全球顶尖的 AI 模型构建应用</h2>
              <p className="max-w-2xl text-primary-foreground/80">
                在一个平台上访问视频、图像、音乐和聊天 API，更快、更实惠，而且开发者友好。
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/console" className="no-underline">
                  立即获取免费 API 密钥
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {homeContent && (
        <section className="border-b py-16">
          <div className="container mx-auto px-6">
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
              dangerouslySetInnerHTML={{ __html: homeContent }}
            />
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
