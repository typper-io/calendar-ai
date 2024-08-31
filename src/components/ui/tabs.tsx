'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Tab = string

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  tabClassName,
  defaultTab,
  onTabChange,
}: {
  tabs: Tab[]
  containerClassName?: string
  tabClassName?: string
  contentClassName?: string
  defaultTab?: string
  onTabChange?: (tab: Tab) => void
}) => {
  const [active, setActive] = useState<Tab>(defaultTab || propTabs[0])

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full bg-muted w-fit rounded-full p-1',
          containerClassName,
        )}
      >
        {propTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActive(tab)
              onTabChange?.(tab)
            }}
            className={cn('relative px-4 py-2 rounded-full', tabClassName)}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active === tab && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className={cn('absolute inset-0 bg-muted rounded-full', {
                  'bg-background': active === tab,
                })}
              />
            )}

            <span
              className={cn('relative block text-muted-foreground', {
                'text-foreground': active === tab,
              })}
            >
              {tab}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
