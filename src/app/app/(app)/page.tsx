'use client'

import { Calendar } from '@/components/calendar'
import { CommandK } from '@/components/cmdk'
import { FloatingDock } from '@/components/ui/floating-dock'
import { useEffect, useState } from 'react'

export default function App() {
  const [commandKOpen, setCommandKOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState<string>('')
  const [updatedEvents, setUpdatedEvents] = useState<Array<UpdateEvent>>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandKOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <div className="relative">
      <div className="flex-grow overflow-hidden">
        <Calendar updatedEvents={updatedEvents} />
      </div>

      <CommandK
        isOpen={commandKOpen}
        setIsOpen={() => setCommandKOpen(false)}
        setChatOpen={setChatOpen}
      />

      <div className="absolute bottom-10 transform -translate-x-1/2 left-1/2 z-10">
        <FloatingDock
          setCommandKOpen={setCommandKOpen}
          setChatOpen={setChatOpen}
          chatOpen={chatOpen}
          setUpdatedEvents={setUpdatedEvents}
        />
      </div>
    </div>
  )
}
