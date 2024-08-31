'use client'

import { StreamableValue, useStreamableValue } from 'ai/rsc'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, stagger, useAnimate } from 'framer-motion'

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream)
  const [scope, animate] = useAnimate()
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (text && !hasAnimated.current) {
      animate(
        'span',
        {
          opacity: 1,
          filter: 'blur(0px)',
        },
        {
          duration: 0.5,
          delay: stagger(0.2),
        },
      )
      hasAnimated.current = true
    }
  }, [text, animate])

  const renderWords = (content: string) => {
    const wordsArray = content.split?.(' ') ?? []

    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className="text-foreground opacity-0"
            style={{
              filter: 'blur(10px)',
            }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </motion.div>
    )
  }

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
        p: ({ children }) => renderWords(children as string),
      }}
    >
      {text}
    </Markdown>
  )
}
