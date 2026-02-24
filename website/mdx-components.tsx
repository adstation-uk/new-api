import type { MDXComponents } from 'mdx/types'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { MdxCodeBlock } from '@/components/mdx/mdx-code-block'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type MdxAnchorProps = ComponentPropsWithoutRef<'a'>
type MdxPreProps = ComponentPropsWithoutRef<'pre'> & { children?: ReactNode }
type MdxCodeProps = ComponentPropsWithoutRef<'code'> & { children?: ReactNode }

function MdxLink({ href = '', className, children, ...props }: MdxAnchorProps) {
  const isInternal = href.startsWith('/')
  const isAnchor = href.startsWith('#')

  const linkClassName = cn('font-medium text-primary underline-offset-4 hover:underline', className)

  if (isInternal) {
    return (
      <Link href={href as never} className={linkClassName}>
        {children}
      </Link>
    )
  }

  if (isAnchor) {
    return (
      <a href={href} className={linkClassName} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a
      href={href}
      className={linkClassName}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    >
      {children}
    </a>
  )
}

function MdxPre({ children, className }: MdxPreProps) {
  if (
    children
    && typeof children === 'object'
    && 'props' in children
    && typeof children.props === 'object'
    && children.props
  ) {
    const codeProps = children.props as { className?: string, children?: ReactNode }
    const languageClass = codeProps.className || ''
    const language = languageClass.replace('language-', '').trim() || 'text'

    const codeContent = Array.isArray(codeProps.children)
      ? codeProps.children.join('')
      : (typeof codeProps.children === 'string' ? codeProps.children : '')

    if (codeContent) {
      return <MdxCodeBlock code={codeContent} language={language} className={className} />
    }
  }

  return <pre className={className}>{children}</pre>
}

function MdxInlineCode({ className, children, ...props }: MdxCodeProps) {
  return (
    <code
      className={cn('rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]', className)}
      {...props}
    >
      {children}
    </code>
  )
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: MdxLink,
    pre: MdxPre,
    code: MdxInlineCode,
    ...components,
  }
}
