import { toast } from 'sonner'
import { getOAuthStateAction } from '@/app/actions/auth'

export async function onGitHubOAuthClicked(github_client_id: string) {
  const data = await getOAuthStateAction()
  if (data.success) {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${data.data}&scope=user:email`
  }
  else {
    toast.error(data.message || '获取状态失败')
  }
}

export async function onDiscordOAuthClicked(discord_client_id: string) {
  const data = await getOAuthStateAction()
  if (data.success) {
    const redirect_uri = `${window.location.origin}/oauth/discord`
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${discord_client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=identify+openid&state=${data.data}`
  }
  else {
    toast.error(data.message || '获取状态失败')
  }
}

export async function onLinuxDOOAuthClicked(linuxdo_client_id: string) {
  const data = await getOAuthStateAction()
  if (data.success) {
    window.location.href = `https://connect.linux.do/oauth2/authorize?response_type=code&client_id=${linuxdo_client_id}&state=${data.data}`
  }
  else {
    toast.error(data.message || '获取状态失败')
  }
}

export async function onOIDCClicked(auth_url: string, client_id: string) {
  const data = await getOAuthStateAction()
  if (data.success) {
    const url = new URL(auth_url)
    url.searchParams.set('client_id', client_id)
    url.searchParams.set('redirect_uri', `${window.location.origin}/oauth/oidc`)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid profile email')
    url.searchParams.set('state', data.data)
    window.location.href = url.toString()
  }
  else {
    toast.error(data.message || '获取状态失败')
  }
}
