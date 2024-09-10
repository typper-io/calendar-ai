'use client'

import { useEffect, useState } from 'react'
import { useActions, readStreamableValue } from 'ai/rsc'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'
import { ClientMessage } from '@/app/actions'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function Chat({
  closeChat,
  chatOpen,
  refetchEvents,
}: {
  closeChat: () => void
  chatOpen: string
  refetchEvents?: () => void // TODO make this work
}) {
  const [input, setInput] = useState(chatOpen)
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [threadId, setThreadId] = useState('')
  const [_refetchJobs, setRefetchJobs] = useState<
    Array<{
      action: string
      [key: string]: any
    }>
  >([])
  const [_proceededRefetchJobs, _setProceededRefetchJobs] = useState<
    Array<{
      action: string
      [key: string]: any
    }>
  >([]) // TODO set when refetchJobs is processed

  const { submitMessage } = useActions()

  const handleSubmission = async () => {
    try {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: '123',
          status: 'user.message.created',
          text: input,
          gui: null,
        },
      ])

      const response = await submitMessage(input, threadId)

      ;(async () => {
        for await (const delta of readStreamableValue<string>(
          response.threadIdStream,
        )) {
          setThreadId(delta!)
        }
      })()
      ;(async () => {
        for await (const delta of readStreamableValue<
          Array<{
            action: string
            [key: string]: any
          }>
        >(response.refetchJobsStream)) {
          setRefetchJobs(delta!)
          refetchEvents?.() // make this work properly
        }
      })()

      setMessages((currentMessages) => [...currentMessages, response])
    } catch (error) {
      toast('Error sending message')
    }
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeChat()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [closeChat])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex border-r-1 border-r-border border-solid flex-col-reverse w-full h-full py-4"
    >
      <div className="flex flex-row gap-2 p-2 w-full">
        <PlaceholdersAndVanishInput
          onChange={(event) => setInput(event.target.value)}
          placeholders={[
            "What i'm have for this week?",
            'What is the plan for today?',
            'What is the plan for tomorrow?',
            'Can i schedule a meeting?',
            'Schedule a meeting with John Doe',
          ]}
          onSubmit={handleSubmission}
          value={input}
          setValue={setInput}
        />
      </div>

      <div className="flex flex-col overflow-y-auto h-[calc(100dvh-100px)]">
        {messages.map((message, index) => (
          <div
            key={message.id + index}
            className={'flex flex-col gap-1 p-2 w-full'}
          >
            <div className="flex flex-col gap-2">{message.gui}</div>
            {message.status === 'user.message.created' ? (
              <div className="bg-primary text-primary-foreground rounded-md w-fit p-2 self-end">
                <Markdown
                  disallowedElements={['img', 'code']}
                  remarkPlugins={[remarkGfm]}
                  className="prose flex flex-col gap-2"
                  components={{
                    a: ({ children, href }) => (
                      <Link href={href!} className="text-primary-foreground">
                        {children}
                      </Link>
                    ),
                    pre: ({ children }) => (
                      <pre className="not-prose">{children}</pre>
                    ),
                  }}
                >
                  {message.text as string}
                </Markdown>
              </div>
            ) : (
              <>{message.text}</>
            )}
          </div>
        ))}
      </div>

      <Button variant="ghost" className="w-fit" onClick={closeChat}>
        <ArrowLeft size={24} />
      </Button>
    </motion.div>
  )
}
