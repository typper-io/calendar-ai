import React, { createContext, useContext, useState } from 'react'

type ActiveEvent = {
  uniqueId: string
  title: string
  start: Date | null
  end: Date | null
  allDay: boolean
  timeText: string
  description: string
  attendees: string[]
  recurrence: string[]
  hangoutLink: string
  videoConferenceLink: string
  responseStatus: string
}

type ModalContextType = {
  activeEvent: ActiveEvent | null
  setActiveEvent: (event: ActiveEvent | null) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeEvent, setActiveEvent] = useState<any | null>(null)

  return (
    <ModalContext.Provider value={{ activeEvent, setActiveEvent }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
