import { useCallback, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { DatesSetArg, EventInput } from '@fullcalendar/core'
import CustomHeader from '@/components/custom-header'
import { useSession } from 'next-auth/react'
import { ExpandedEventModal } from '@/components/expanded-event-modal'
import { ExpandableEvent } from '@/components/expandable-event'
import { ModalProvider } from '@/hooks/use-modal'
import { toast } from 'sonner'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees?: { name: string; avatar?: string }[]
  description?: string
  location?: string
  isFlexible?: boolean
}

export interface College {
  id: string
  name: string
  email: string
  organization: string
}

export function Calendar() {
  const { data: session } = useSession()

  const [events, setEvents] = useState<EventInput[]>([])
  const [cachedRanges, setCachedRanges] = useState<
    { start: string; end: string }[]
  >([])
  const calendarRef = useRef<FullCalendar>(null)

  const fetchEvents = useCallback(
    async (start: string, end: string) => {
      if (!session) return

      try {
        const response = await fetch(
          `/api/calendar/events?start=${start}&end=${end}`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()

        setEvents((prevEvents) => {
          const newEvents = data.events?.filter?.(
            (newEvent: EventInput) =>
              !prevEvents.some(
                (existingEvent) => existingEvent.id === newEvent.id,
              ),
          )

          return [...prevEvents, ...(newEvents || [])]
        })

        setCachedRanges((prevRanges) => [...prevRanges, { start, end }])
      } catch (error) {
        toast('Failed to fetch events')
      }
    },
    [session],
  )

  const isRangeCached = useCallback(
    (start: string, end: string) => {
      return cachedRanges.some(
        (range) => range.start <= start && range.end >= end,
      )
    },
    [cachedRanges],
  )
  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      const start = arg.startStr
      const end = arg.endStr

      if (!isRangeCached(start, end)) {
        fetchEvents(start, end)
      }
    },
    [fetchEvents, isRangeCached],
  )

  return (
    <ModalProvider>
      <div className="h-screen overflow-auto p-4 flex flex-col gap-2">
        <CustomHeader calendarRef={calendarRef} />

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={true}
          events={events}
          height="100%"
          views={{
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'short' },
              dayHeaderFormat: { weekday: 'short', day: 'numeric' },
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'short' },
              dayHeaderFormat: { weekday: 'long', day: 'numeric' },
            },
          }}
          dayHeaderContent={(arg: any) => (
            <>
              <span>
                {arg.date
                  .toLocaleDateString('en-US', { weekday: 'short' })
                  .replace('.', '')}
              </span>{' '}
              <span>{arg.date.getDate()}</span>
            </>
          )}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
          }}
          nowIndicator
          now={new Date()}
          selectable={false}
          datesSet={handleDatesSet}
          eventContent={function renderEventContent(arg) {
            return <ExpandableEvent {...arg} />
          }}
          editable={false}
          droppable={false}
        />

        <ExpandedEventModal />
      </div>
    </ModalProvider>
  )
}
