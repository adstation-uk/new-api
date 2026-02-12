import { MDXRemote } from 'next-mdx-remote/rsc'
import * as React from 'react'

type MDXRendererProps = {
  source: string
}

export function MDXRenderer({ source }: MDXRendererProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote source={source} />
    </div>
  )
}
