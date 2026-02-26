'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MdxCodeBlockProps = {
  code: string
  language?: string
  className?: string
}

export function MdxCodeBlock({ code, language = 'text', className }: MdxCodeBlockProps) {
  const t = useTranslations('Page.Marketing.Mdx')
  const [copied, setCopied] = useState(false)

  const normalizedCode = useMemo(() => code.replace(/\n$/, ''), [code])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
    catch {
      setCopied(false)
    }
  }

  return (
    <div className={cn('my-5 overflow-hidden rounded-lg border', className)}>
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{language}</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onCopy}>
          {copied
            ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {t('copied')}
                </>
              )
            : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {t('copy')}
                </>
              )}
        </Button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '1rem',
        }}
        codeTagProps={{ style: { fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' } }}
      >
        {normalizedCode}
      </SyntaxHighlighter>
    </div>
  )
}
