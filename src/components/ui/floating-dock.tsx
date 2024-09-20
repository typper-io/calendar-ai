'use client'

import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Command, Settings, Sparkles } from 'lucide-react'
import { useCommandK } from '@/hooks/use-command'
import { useChat } from '@/hooks/use-chat'
import { useDevice } from '@/hooks/use-device'
import { Badge } from '@/components/ui/badge'

export const FloatingDock = () => {
  const { chatOpen, setChatOpen } = useChat()
  const { setCommandKOpen } = useCommandK()
  const { isMobile } = useDevice()

  const items = [
    {
      title: 'Assistant (Q)',
      icon: <Sparkles size={24} />,
      action: () => setChatOpen('Hello!'),
    },
    ...(!isMobile
      ? [
          {
            title: 'Command (CMD + K)',
            icon: <Command size={24} />,
            action: () => setCommandKOpen(true),
          },
          {
            title: 'Settings',
            icon: <Settings size={24} />,
            href: '/settings',
            soon: true,
          },
        ]
      : []),
  ]

  const width = useMemo(() => {
    if (chatOpen) {
      return isMobile ? '100vw' : '500px'
    }

    return isMobile ? '64px' : '250px'
  }, [chatOpen, isMobile])

  const height = useMemo(() => {
    if (chatOpen) {
      return isMobile ? '100dvh' : '500px'
    }

    return '64px'
  }, [chatOpen, isMobile])

  return (
    <div
      className={cn('z-10 w-fit absolute bottom-10', {
        'bottom-0': chatOpen && isMobile,
        'right-10': isMobile && !chatOpen,
        'left-1/2 -translate-x-1/2': !isMobile,
      })}
    >
      <div className="relative w-fit">
        <div
          className={cn('bg-background/80 absolute inset-0 rounded-full', {
            'rounded-none': chatOpen && isMobile,
          })}
        />
        <motion.div
          animate={{
            height,
            width,
          }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
          className={cn(
            'relative mx-auto flex gap-4 p-2 items-center justify-center shadow-sm backdrop-blur-3xl dark:bg-foreground/5',
            {
              'rounded-full': !chatOpen,
              'rounded-3xl': chatOpen && !isMobile,
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
    </div>
  )
}

interface IconContainerProps {
  title: string
  icon: React.ReactNode
  href?: string
  action?: () => void
  soon?: boolean
}

function IconContainer({
  icon,
  title,
  href,
  action,
  soon,
}: IconContainerProps) {
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
      <div className="flex items-center justify-center relative">
        {soon && (
          <Badge className="absolute -top-5 -right-8" variant="secondary">
            Soon
          </Badge>
        )}
        {icon}
      </div>
    </Container>
  )
}
