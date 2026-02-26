'use client'

import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'

export function TokenSearch({
  initialKeyword,
  initialToken,
}: {
  initialKeyword: string
  initialToken: string
}) {
  const t = useTranslations('Page.Console.Token.search')
  const [keyword, setKeyword] = useState(initialKeyword)
  const [token, setToken] = useState(initialToken)
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    if (keyword)
      params.set('keyword', keyword)
    else params.delete('keyword')

    if (token)
      params.set('token', token)
    else params.delete('token')

    params.set('p', '1')
    router.push(`/console/token?${params.toString()}`)
  }

  const handleReset = () => {
    setKeyword('')
    setToken('')
    router.push('/console/token')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-1 justify-end">
      <div className="relative flex-1 max-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('namePlaceholder')}
          className="pl-8 h-9"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div className="relative flex-1 max-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('keyPlaceholder')}
          className="pl-8 h-9"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleSearch} className="h-9">
          {t('search')}
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset} className="h-9">
          {t('reset')}
        </Button>
      </div>
    </div>
  )
}
