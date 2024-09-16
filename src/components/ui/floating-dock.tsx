'use client'

import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Command, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCommandK } from '@/hooks/use-command'
import { useChat } from '@/hooks/use-chat'

export const FloatingDock = () => {
  const { chatOpen, setChatOpen } = useChat()
  const { setCommandKOpen } = useCommandK()
  const pathname = usePathname()

  const items = [
    {
      title: 'Calendar',
      icon: <Calendar size={24} />,
      href: '/app',
    },
    ...(pathname === '/app'
      ? [
          {
            title: 'Command (CMD + K)',
            icon: <Command size={24} />,
            action: () => setCommandKOpen(true),
          },
          {
            title: 'Assistant',
            icon: <Sparkles size={24} />,
            action: () => setChatOpen('Hello!'),
          },
        ]
      : []),
    // TODO implement settings
    // {
    //   title: 'Settings',
    //   icon: <Settings size={24} />,
    //   href: '/app/settings',
    // },
  ]

  return (
    <div className="relative">
      <div className="bg-background/80 absolute inset-0 rounded-full" />
      <motion.div
        animate={{
          height: chatOpen ? '500px' : '64px',
          width: pathname === '/app' ? (chatOpen ? '500px' : '250px') : '180px',
        }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
        className={cn(
          'relative mx-auto flex gap-4 p-2 items-center justify-center shadow-sm',
          {
            'backdrop-blur-3xl rounded-full': !chatOpen,
            'backdrop-blur-3xl rounded-3xl': chatOpen,
          },
        )}
      >
        <AnimatePresence mode="wait">
          {!chatOpen ? (
            items.map((item) => <IconContainer key={item.title} {...item} />)
          ) : (
            <Chat chatOpen={chatOpen} closeChat={() => setChatOpen('')} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

interface IconContainerProps {
  title: string
  icon: React.ReactNode
  href?: string
  action?: () => void
}

function IconContainer({ icon, title, href, action }: IconContainerProps) {
  const [hovered, setHovered] = useState(false)

  const commonProps = {
    key: 'icons',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    className:
      'aspect-square hover:bg-background flex items-center justify-center relative h-16 w-16 rounded-full cursor-pointer',
  }

  const Container = href ? motion.a : motion.div
  const containerProps = href ? { href } : { onClick: action }

  return (
    <Container {...commonProps} {...containerProps}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 2, x: '-50%' }}
            className="px-2 py-0.5 whitespace-pre rounded-md bg-background border text-foreground absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-center">{icon}</div>
    </Container>
  )
}
