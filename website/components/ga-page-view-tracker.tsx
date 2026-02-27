'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/ga-events'

export function GaPageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname)
      return
    trackPageView(pathname)
  }, [pathname])

  return null
}
