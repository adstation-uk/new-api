'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/i18n/navigation'
import { trackOAuthLoginConversions } from '@/lib/ga-events'

const PROVIDER_MAP: Record<string, string> = {
  github: 'github',
  discord: 'discord',
  linuxdo: 'linuxdo',
  oidc: 'oidc',
}

const MAX_RETRIES = 3

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ provider: string }>()
  const t = useTranslations('Common')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const provider = PROVIDER_MAP[params.provider]
      if (!provider) {
        toast.error(t('oauth.unsupportedProvider'))
        router.replace('/login')
        return
      }

      const code = searchParams.get('code')
      const state = searchParams.get('state') || ''

      if (!code) {
        toast.error(t('oauth.missingAuthCode'))
        router.replace('/login')
        return
      }

      for (let retry = 0; retry <= MAX_RETRIES; retry++) {
        try {
          const response = await fetch(`/api/oauth/${provider}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
            method: 'GET',
            credentials: 'include',
          })
          const result = await response.json()

          if (!result.success) {
            throw new Error(result.message || t('oauth.callbackError'))
          }

          if (cancelled) {
            return
          }

          if (result.message === 'bind') {
            localStorage.removeItem('oauth_source')
            toast.success(t('oauth.bindSuccess'))
            router.replace('/console/personal')
            return
          }

          const oauthSource = localStorage.getItem('oauth_source')
          trackOAuthLoginConversions(oauthSource)
          localStorage.removeItem('oauth_source')
          toast.success(t('toast.loginSuccess'))
          router.replace('/console/token')
          return
        }
        catch (error) {
          if (retry < MAX_RETRIES) {
            await wait((retry + 1) * 2000)
            continue
          }

          if (!cancelled) {
            const message = error instanceof Error ? error.message : t('errors.network')
            toast.error(message)
            localStorage.removeItem('oauth_source')
            router.replace('/console/personal')
          }
          return
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [params.provider, router, searchParams, t])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t('oauth.loading')}</span>
      </div>
    </div>
  )
}
