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
  { labelKey: 'hero.metrics.uptime', value: '99.9%+', icon: <Shield className="size-4" /> },
  { labelKey: 'hero.metrics.avgResponse', value: '24.7s', icon: <Timer className="size-4" /> },
  { labelKey: 'hero.metrics.support', value: '24/7', icon: <Rocket className="size-4" /> },
  { labelKey: 'hero.metrics.security', value: '#1', icon: <Lock className="size-4" /> },
]

const API_USE_CASES = [
  {
    titleKey: 'useCases.video.title',
    descKey: 'useCases.video.desc',
  },
  {
    titleKey: 'useCases.image.title',
    descKey: 'useCases.image.desc',
  },
  {
    titleKey: 'useCases.music.title',
    descKey: 'useCases.music.desc',
  },
  {
    titleKey: 'useCases.chat.title',
    descKey: 'useCases.chat.desc',
  },
]

const WHY_ITEMS = [
  {
    titleKey: 'why.pricing.title',
    descKey: 'why.pricing.desc',
    icon: <Coins className="size-5 text-primary" />,
  },
  {
    titleKey: 'why.trial.title',
    descKey: 'why.trial.desc',
    icon: <Zap className="size-5 text-primary" />,
  },
  {
    titleKey: 'why.integration.title',
    descKey: 'why.integration.desc',
    icon: <FileText className="size-5 text-primary" />,
  },
  {
    titleKey: 'why.performance.title',
    descKey: 'why.performance.desc',
    icon: <Rocket className="size-5 text-primary" />,
  },
  {
    titleKey: 'why.security.title',
    descKey: 'why.security.desc',
    icon: <Shield className="size-5 text-primary" />,
  },
  {
    titleKey: 'why.support.title',
    descKey: 'why.support.desc',
    icon: <Scale className="size-5 text-primary" />,
  },
]

const HOT_MODELS = [
  { name: 'Google Veo 3.1', typeKey: 'hotModels.video', descKey: 'hotModels.veo' },
  { name: 'Runway Aleph', typeKey: 'hotModels.video', descKey: 'hotModels.runway' },
  { name: 'Suno API', typeKey: 'hotModels.music', descKey: 'hotModels.suno' },
  { name: '4o Image API', typeKey: 'hotModels.image', descKey: 'hotModels.image4o' },
  { name: 'Flux.1 Kontext', typeKey: 'hotModels.image', descKey: 'hotModels.flux' },
  { name: 'Nano Banana', typeKey: 'hotModels.edit', descKey: 'hotModels.nano' },
]

const FAQ_ITEMS = [
  { qKey: 'faq.q1', aKey: 'faq.a1' },
  { qKey: 'faq.q2', aKey: 'faq.a2' },
  { qKey: 'faq.q3', aKey: 'faq.a3' },
  { qKey: 'faq.q4', aKey: 'faq.a4' },
  { qKey: 'faq.q5', aKey: 'faq.a5' },
  { qKey: 'faq.q6', aKey: 'faq.a6' },
]

export default async function HomePage() {
  const user = await getOptionalUserInfo()
  const t = await getTranslations('Page.Home')

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
                {t('hero.badge')}
              </Badge>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                {t('hero.title', { username: user?.username ?? 'Guest' })}
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                {t('hero.subtitle')}
              </p>

              <div>
                <ServerAddressClient />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild className="h-11 rounded-xl px-6">
                  <Link href="/console" className="no-underline">
                    {t('hero.getKey')}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-11 rounded-xl px-6">
                  <Link href="https://docs.newapi.pro" target="_blank" className="no-underline">
                    {t('hero.docs')}
                  </Link>
                </Button>
              </div>

              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {HERO_METRICS.map(item => (
                  <div key={item.labelKey} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                    {item.icon}
                    <span className="text-muted-foreground">{t(item.labelKey)}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-none">
              <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
              <CardHeader>
                <CardTitle>{t('models.title')}</CardTitle>
                <CardDescription>{t('models.subtitle')}</CardDescription>
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
                  <Link href="/models" className="no-underline">{t('models.all')}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t('useCases.sectionTitle')}</h2>
            <p className="mt-4 text-muted-foreground">{t('useCases.sectionSubtitle')}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {API_USE_CASES.map((item, index) => (
              <Card key={item.titleKey} className="relative overflow-hidden rounded-2xl">
                {index === 0 && <ShineBorder shineColor={['#ffaa40', '#9c40ff']} duration={10} />}
                <CardHeader>
                  <CardTitle className="text-2xl">{t(item.titleKey)}</CardTitle>
                  <CardDescription className="leading-7">{t(item.descKey)}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link href="/console" className="no-underline">{t('useCases.getKey')}</Link>
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
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t('why.title')}</h2>
            <p className="mt-4 text-muted-foreground">{t('why.subtitle')}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map(item => (
              <Card key={item.titleKey} className="rounded-2xl border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2 text-lg">
                    <span className="mt-0.5">{item.icon}</span>
                    <span>{t(item.titleKey)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-6">{t(item.descKey)}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t('hotModels.title')}</h2>
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
                  <CardDescription>{t(item.typeKey)}</CardDescription>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{t(item.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/models" className="no-underline">{t('hotModels.exploreAll')}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="container mx-auto px-6 py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t('faq.title')}</h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4">
            {FAQ_ITEMS.map(item => (
              <Card key={item.qKey} className="rounded-xl">
                <CardContent className="p-0">
                  <details className="group p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold marker:content-none">
                      {t(item.qKey)}
                      <Plus className="size-5 transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.aKey)}</p>
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
              <h2 className="text-3xl font-bold md:text-5xl">{t('cta.title')}</h2>
              <p className="max-w-2xl text-primary-foreground/80">
                {t('cta.subtitle')}
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/console" className="no-underline">
                  {t('cta.getKey')}
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
