import { toast } from 'sonner'
import { getOAuthStateAction } from '@/actions/auth-actions'
import { routing } from '@/i18n/routing'

type Translator = (key: string) => string

function getCurrentLocale() {
  const [, maybeLocale] = window.location.pathname.split('/')
  if (routing.locales.includes(maybeLocale as (typeof routing.locales)[number])) {
    return maybeLocale
  }
  return routing.defaultLocale
}

export async function onGitHubOAuthClicked(github_client_id: string, t: Translator) {
  const data = await getOAuthStateAction()
  if (data.success) {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${data.data}&scope=user:email`
  }
  else {
    toast.error(data.message || t('errors.getStateFailed'))
  }
}

export async function onDiscordOAuthClicked(discord_client_id: string, t: Translator) {
  const data = await getOAuthStateAction()
  if (data.success) {
    const locale = getCurrentLocale()
    const redirect_uri = `${window.location.origin}/${locale}/oauth/discord`
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${discord_client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=identify+openid&state=${data.data}`
  }
  else {
    toast.error(data.message || t('errors.getStateFailed'))
  }
}

export async function onLinuxDOOAuthClicked(linuxdo_client_id: string, t: Translator) {
  const data = await getOAuthStateAction()
  if (data.success) {
    window.location.href = `https://connect.linux.do/oauth2/authorize?response_type=code&client_id=${linuxdo_client_id}&state=${data.data}`
  }
  else {
    toast.error(data.message || t('errors.getStateFailed'))
  }
}

export async function onOIDCClicked(auth_url: string, client_id: string, t: Translator) {
  const data = await getOAuthStateAction()
  if (data.success) {
    const locale = getCurrentLocale()
    const url = new URL(auth_url)
    url.searchParams.set('client_id', client_id)
    url.searchParams.set('redirect_uri', `${window.location.origin}/${locale}/oauth/oidc`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', data.data)
    window.location.href = url.toString()
  }
  else {
    toast.error(data.message || t('errors.getStateFailed'))
  }
}
