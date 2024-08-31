'use client'

import Balancer from 'react-wrap-balancer'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Compare } from '@/components/ui/compare'
import Link from 'next/link'

export const Hero = () => {
  return (
    <div className="flex flex-col min-h-screen pt-20 md:pt-40 relative overflow-hidden">
      <motion.h1
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: 'easeOut',
          duration: 0.5,
        }}
        className="text-2xl md:text-4xl lg:text-8xl font-semibold max-w-6xl mx-auto text-center mt-6 relative z-10"
      >
        <Balancer>Manage your calendar using AI ✨</Balancer>
      </motion.h1>
      <motion.p
        initial={{
          y: 40,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: 'easeOut',
          duration: 0.5,
          delay: 0.2,
        }}
        className="text-center mt-6 text-base md:text-xl text-muted-foreground max-w-3xl mx-auto relative z-10"
      >
        <Balancer>
          Calendar AI is a smart calendar that uses AI to help you manage your
          calendar. It's like magic, and it's free forever.
        </Balancer>
      </motion.p>
      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          ease: 'easeOut',
          duration: 0.5,
          delay: 0.4,
        }}
        className="flex items-center gap-4 justify-center mt-6 relative z-10"
      >
        <Button asChild>
          <Link href="/login">Get started</Link>
        </Button>
      </motion.div>

      <div className="p-4 border border-neutral-200 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-[32px] mt-20 relative">
        <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none" />
        <Compare
          firstImage="/organized_calendar.png"
          secondImage="/disorganized_calendar.png"
          firstImageClassname="object-cover object-top w-full"
          secondImageClassname="object-cover object-top w-full"
          className="w-full max-w-full aspect-square max-h-[400px] rounded-[20px]"
          slideMode="hover"
          autoplay={true}
        />
      </div>
    </div>
  )
}
