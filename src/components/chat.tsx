'use client'

import { useEffect, useState, useRef } from 'react'
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
import { User } from '@/components/ui/mentions-input'
import { cn } from '@/lib/utils'

export function Chat({
  closeChat,
  chatOpen,
}: {
  closeChat: () => void
  chatOpen: string
}) {
  const [input, setInput] = useState(chatOpen)
  const [messages, setMessages] = useState<ClientMessage[]>([])
  const [threadId, setThreadId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [contacts, setContacts] = useState<Array<User>>([])
  const [selectedUserIndex, setSelectedUserIndex] = useState(0)

  const { submitMessage } = useActions()

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await fetch('/api/contacts')

      if (!response.ok) {
        return toast('Failed to fetch contacts.')
      }

      const data = await response.json()
      setContacts(
        data.contacts.map((email: string) => ({ id: email, display: email })),
      )
    }

    fetchContacts()
  }, [])

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

      setMessages((currentMessages) => [...currentMessages, response])
    } catch (error) {
      toast('Error sending message')
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInput(newValue)
    checkForMentionTrigger(newValue, event.target.selectionStart)
  }

  const checkForMentionTrigger = (text: string, cursorPos: number | null) => {
    const lastAtSymbol = text.lastIndexOf('@', cursorPos || 0 - 1)
    if (
      lastAtSymbol !== -1 &&
      (lastAtSymbol === 0 || text[lastAtSymbol - 1] === ' ')
    ) {
      const mentionText = text.slice(lastAtSymbol + 1, cursorPos || 0)
      const filtered = mentionText.toLowerCase()
        ? contacts.filter((user) =>
            user.display.toLowerCase().startsWith(mentionText.toLowerCase()),
          )
        : contacts
      setFilteredUsers(filtered)
      setShowDropdown(filtered.length > 0)
      setSelectedUserIndex(0)
    } else {
      setShowDropdown(false)
    }
  }

  const handleUserSelect = (user: User) => {
    const lastAtSymbol = input.lastIndexOf('@')
    const newInputValue =
      input.slice(0, lastAtSymbol) +
      user.display +
      input.slice(lastAtSymbol + 1)
    setInput(newInputValue)
    setShowDropdown(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedUserIndex((prevIndex) =>
            Math.min(prevIndex + 1, filteredUsers.length - 1),
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedUserIndex((prevIndex) => Math.max(prevIndex - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredUsers[selectedUserIndex]) {
            handleUserSelect(filteredUsers[selectedUserIndex])
          }
          break
        case 'Escape':
          setShowDropdown(false)
          break
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmission()
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
      <div className="flex flex-row gap-2 p-2 w-full relative">
        <PlaceholdersAndVanishInput
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
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
          showDropdown={showDropdown}
        />
        {showDropdown && (
          <div className="absolute bottom-full left-0 bg-background border rounded shadow-lg z-[99] w-full max-h-[100px] overflow-y-auto overflow-x-hidden">
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  'px-4 py-2 hover:bg-muted cursor-pointer truncate',
                  {
                    'bg-muted': index === selectedUserIndex,
                  },
                )}
                onClick={() => handleUserSelect(user)}
              >
                {user.display}
              </div>
            ))}
          </div>
        )}
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
