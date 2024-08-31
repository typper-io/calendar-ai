'use client'

import { stagger, useAnimate } from 'framer-motion'
import React, { useState } from 'react'

export const SkeletonTwo = () => {
  const [scope, animate] = useAnimate()
  const [animating, setAnimating] = useState(false)

  const handleAnimation = async () => {
    if (animating) return

    setAnimating(true)
    await animate(
      '.message',
      {
        opacity: [0, 1],
        y: [20, 0],
      },
      {
        delay: stagger(0.5),
      },
    )
    setAnimating(false)
  }
  return (
    <div className="relative h-full w-full mt-4">
      <div
        onMouseEnter={handleAnimation}
        ref={scope}
        className="content mt-4 w-[90%] mx-auto"
      >
        <UserMessage>Schedule a meeting with John Doe</UserMessage>

        <AIMessage>
          The best time to meet John Doe is on Monday at 2:00 PM
        </AIMessage>

        <UserMessage>
          Ok! Just do it. I&apos;ll be there at 2:00 PM on Monday
        </UserMessage>

        <AIMessage>
          Scheduled! I&apos;ll remind you 30 minutes before the meeting
        </AIMessage>

        <UserMessage>Thanks!</UserMessage>

        <AIMessage>
          You&apos;re welcome! If you need anything else, feel free to ask
        </AIMessage>
      </div>
    </div>
  )
}

const UserMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="message bg-primary text-primary-foreground p-2 sm:p-4 my-4 rounded-md self-end text-sm">
      {children}
    </div>
  )
}
const AIMessage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="message p-2 sm:p-4 my-4 rounded-md self-start text-sm">
      {children}
    </div>
  )
}
