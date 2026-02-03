'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TokenDrawer } from './token-drawer'

export function TokenCreate() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {' '}
        创建令牌
      </Button>

      <TokenDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
