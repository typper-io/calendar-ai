'use client'

import { StreamableValue, useStreamableValue } from 'ai/rsc'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream)

  return (
    <Markdown
      disallowedElements={['img', 'code']}
      remarkPlugins={[remarkGfm]}
      className="prose flex flex-col gap-2"
      components={{
        a: ({ children, href }) => (
          <Link href={href!} className="text-foreground">
            {children}
          </Link>
        ),
        pre: ({ children }) => <pre className="not-prose">{children}</pre>,
      }}
    >
      {text}
    </Markdown>
  )
}
