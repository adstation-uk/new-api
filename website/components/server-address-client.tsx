'use client'

import { Copy } from 'lucide-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ServerAddressClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true)
  }, [])

  const serverAddress = mounted ? window.location.origin : ''

  const handleCopyBaseURL = () => {
    if (!serverAddress)
      return
    navigator.clipboard.writeText(serverAddress)
    toast.success('已复制到剪切板')
  }

  return (
    <div className="w-full max-w-md mb-10">
      <div className="relative flex items-center h-14 w-full bg-muted border rounded-xl px-4 hover:border-primary/50 transition-colors group">
        <input
          readOnly
          value={serverAddress}
          className="bg-transparent border-none outline-none flex-1 text-foreground font-medium focus:ring-0 w-full"
        />
        <button
          onClick={handleCopyBaseURL}
          className="ml-2 p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer border-none flex items-center justify-center"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  )
}
