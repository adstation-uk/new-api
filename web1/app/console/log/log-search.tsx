'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LogSearch({ initialKeyword }: { initialKeyword: string }) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    params.set('keyword', keyword)
    params.set('p', '1')
    router.push(`/console/log?${params.toString()}`)
  }

  return (
    <div className="relative flex-1 max-w-sm flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索 Token 名称..."
          className="pl-8"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <Button variant="secondary" onClick={handleSearch}>
        搜索
      </Button>
    </div>
  )
}
