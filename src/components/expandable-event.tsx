import { EventContentArg } from '@fullcalendar/core/index.js'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useModal } from '@/hooks/use-modal'
import { toast } from 'sonner'
import { useEvents } from '@/hooks/use-events'

type ExtendedProps = {
  description: string
  attendees: string[]
  recurrence: string[]
  hangoutLink: string
  videoConferenceLink: string
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
}

export function ExpandableEvent(props: EventContentArg) {
  const { event, isPast, timeText, isDragging } = props
  const { setActiveEvent } = useModal()
  const { refetchEvents } = useEvents()

  const { responseStatus } = event.extendedProps as ExtendedProps

  const isSmallThen1Hour =
    (event.end?.getTime() || 0) - (event.start?.getTime() || 0) < 3600001
  const isSmallThen30Minutes =
    (event.end?.getTime() || 0) - (event.start?.getTime() || 0) < 1800001

  const uniqueId = `${event.id || event.title}-${event.start?.toISOString()}`

  const handleDeleteEvent = async () => {
    const eventData = {
      id: event.id,
    }

    await fetch('/api/calendar/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    await refetchEvents()

    toast('Event has been deleted.')
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          layoutId={`card-${uniqueId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
              'cursor-grabbing': isDragging,
              'line-through decoration-primary': responseStatus === 'declined',
            },
          )}
        >
          <div
            className={cn(
              'flex bg-primary/20 w-full h-full rounded-md shadow-md relative',
              {
                'opacity-50': responseStatus === 'declined' || isPast,
              },
            )}
          >
            <div
              className={cn('inset-0 absolute', {
                'bg-stripes':
                  responseStatus === 'needsAction' ||
                  responseStatus === 'tentative',
              })}
            />
            <div
              className={cn('h-full w-1 bg-primary rounded-md flex-shrink-0')}
            />

            <div
              className={cn('w-full h-full', {
                'px-2': isSmallThen1Hour,
                'flex gap-2 items-center': isSmallThen30Minutes,
                'p-2': !isSmallThen1Hour,
              })}
            >
              <motion.p
                layoutId={`title-${uniqueId}`}
                className={cn('font-semibold truncate text-primary', {
                  'text-base': !isSmallThen1Hour,
                  'text-sm': isSmallThen1Hour,
                  'text-xs': isSmallThen30Minutes,
                })}
              >
                {event.title}
              </motion.p>
              {!isSmallThen30Minutes && (
                <p className="text-sm truncate text-primary">{timeText}</p>
              )}
            </div>
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleDeleteEvent}>
          Delete event
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
