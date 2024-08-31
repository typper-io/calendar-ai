'use client'

import { Chat } from '@/components/chat'
import { cn } from '@/lib/utils'
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
} from 'framer-motion'
import { Dispatch, SetStateAction, useState } from 'react'
import { Calendar, Search, Sparkles } from 'lucide-react'

export const FloatingDock = ({
  setCommandKOpen,
  chatOpen,
  setChatOpen,
}: {
  setCommandKOpen: Dispatch<SetStateAction<boolean>>
  chatOpen: string
  setChatOpen: Dispatch<SetStateAction<string>>
}) => {
  const items = [
    {
      title: 'Calendar',
      icon: <Calendar size={24} />,
      href: '/app',
    },
    {
      title: 'Command',
      icon: <Search size={24} />,
      action: () => setCommandKOpen(true),
    },
    {
      title: 'Assistant',
      icon: <Sparkles size={24} />,
      action: () => setChatOpen('Hello!'),
    },
  ]

  let mouseX = useMotionValue(Infinity)

  return (
    <div className="relative">
      <div className="bg-accent/50 absolute inset-0 rounded-full" />
      <motion.div
        animate={{
          height: chatOpen ? '500px' : '64px',
          width: chatOpen ? '500px' : '250px',
        }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
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
            items.map((item) => (
              <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))
          ) : (
            <Chat chatOpen={chatOpen} closeChat={() => setChatOpen('')} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function IconContainer({
  mouseX,
  title,
  icon,
  ...rest
}: {
  mouseX: MotionValue
  title: string
  icon: React.ReactNode
  href?: string
  action?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      key="icons"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={rest.action}
      className="aspect-square hover:bg-accent flex items-center justify-center relative h-16 w-16 rounded-full cursor-pointer"
    >
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
    </motion.div>
  )
}
