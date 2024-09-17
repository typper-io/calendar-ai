import { useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { useModal } from '@/hooks/use-modal'
import { format, isSameDay } from 'date-fns'
import Link from 'next/link'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import { Button } from '@/components/ui/button'
import { Clock, Text, Users, Video } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function ExpandedEventModal() {
  const { activeEvent, setActiveEvent } = useModal()
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, () => setActiveEvent(null))

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveEvent(null)
      }
    }

    if (activeEvent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeEvent, setActiveEvent])

  function formatDateRange(startDate: Date, endDate: Date): string {
    const formatDate = (date: Date): string => format(date, "EEEE, d 'de' MMMM")
    const formatTime = (date: Date): string => format(date, 'H:mm')

    const startFormatted: string = formatDate(startDate)
    const startTime: string = formatTime(startDate)
    const endTime: string = formatTime(endDate)

    if (isSameDay(startDate, endDate)) {
      return `${startFormatted}⋅${startTime} - ${endTime}`
    } else {
      const endFormatted: string = formatDate(endDate)
      return `${startFormatted} ${startTime} - ${endFormatted} ${endTime}`
    }
  }

  if (!activeEvent) return null

  const getVideoPlatform = (videoConferenceLink: string) => {
    if (videoConferenceLink.includes('zoom')) return 'Zoom'

    if (videoConferenceLink.includes('meet')) return 'Google Meet'

    if (videoConferenceLink.includes('teams')) return 'Microsoft Teams'

    return 'Video Conference'
  }

  const pureText = (htmlString: string) => {
    return htmlString.replace(/<[^>]*>/g, '')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/15 h-full w-full z-[9999]"
      />
      <div className="fixed inset-0 grid place-items-center z-[10000]">
        <motion.div
          layoutId={`card-${activeEvent.uniqueId}`}
          ref={ref}
          className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] bg-background/80 rounded-md"
        >
          <div className="backdrop-blur-sm w-full h-full flex flex-col overflow-hidden items-start gap-4 py-4 rounded-md">
            <motion.p
              layoutId={`title-${activeEvent.uniqueId}`}
              className="font-bold text-foreground px-4"
            >
              {activeEvent.title}
            </motion.p>

            <Separator />

            <div>
              {activeEvent.start && activeEvent.end && (
                <div className="px-4 gap-4 flex items-center">
                  <Clock size={24} />

                  <div>
                    <p className="text-muted-foreground text-xs">
                      {formatDateRange(activeEvent.start, activeEvent.end)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {activeEvent.description && (
              <div className="px-4 flex gap-4">
                <Text size={24} className="flex-shrink-0" />

                <p>{pureText(activeEvent.description)}</p>
              </div>
            )}

            {activeEvent.videoConferenceLink && (
              <div className="flex items-center gap-4 px-4">
                <Video size={24} />

                <Button asChild size="sm" variant="secondary">
                  <Link
                    href={activeEvent.videoConferenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join with{' '}
                    {getVideoPlatform(activeEvent.videoConferenceLink)}
                  </Link>
                </Button>
              </div>
            )}

            {activeEvent.attendees.length > 0 && (
              <div className="flex gap-4 items-center px-4">
                <Users size={24} />

                <div className="flex">
                  <AnimatedTooltip
                    items={activeEvent.attendees.map((attendee, idx) => ({
                      id: idx,
                      name: attendee,
                      image: `https://api.dicebear.com/9.x/initials/svg?seed=${attendee}&chars=1`,
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
