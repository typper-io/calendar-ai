import { EventContentArg } from '@fullcalendar/core/index.js'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { useModal } from '@/hooks/use-modal'

type ExtendedProps = {
  description: string
  attendees: string[]
  recurrence: string[]
  hangoutLink: string
  videoConferenceLink: string
  responseStatus: string
}

export function ExpandableEvent(props: EventContentArg) {
  const { event, isPast, timeText, isDragging } = props
  const { setActiveEvent } = useModal()

  const isSmallThen1Hour =
    (event.end?.getTime() || 0) - (event.start?.getTime() || 0) < 3600001
  const isSmallThen30Minutes =
    (event.end?.getTime() || 0) - (event.start?.getTime() || 0) < 1800001

  const uniqueId = `${event.id || event.title}-${event.start?.toISOString()}`

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          layoutId={`card-${uniqueId}`}
          onClick={() =>
            setActiveEvent({
              title: event.title,
              uniqueId,
              allDay: event.allDay,
              start: event.start,
              end: event.end,
              timeText,
              ...(event.extendedProps as ExtendedProps),
            })
          }
          className={cn(
            'w-full h-full overflow-hidden bg-background p-[0.5px] rounded-md cursor-pointer',
            {
              '!opacity-50': isPast,
              'cursor-grabbing': isDragging,
            },
          )}
        >
          <div className="bg-blue-500 w-full h-full rounded-md shadow-md pl-1">
            <div
              className={cn('bg-blue-100/90 w-full h-full', {
                'px-2': isSmallThen1Hour,
                'flex gap-2 items-center': isSmallThen30Minutes,
                'p-2': !isSmallThen1Hour,
              })}
            >
              <motion.p
                layoutId={`title-${uniqueId}`}
                className={cn('font-semibold truncate text-blue-500', {
                  'text-base': !isSmallThen1Hour,
                  'text-sm': isSmallThen1Hour,
                  'text-xs': isSmallThen30Minutes,
                })}
              >
                {event.title}
              </motion.p>
              {!isSmallThen30Minutes && (
                <p className="text-sm truncate text-blue-500">{timeText}</p>
              )}
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>
    </ContextMenu>
  )
}
