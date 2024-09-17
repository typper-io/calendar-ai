'use client'

import { useCallback, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, {
  EventResizeDoneArg,
} from '@fullcalendar/interaction'
import { DatesSetArg, EventDropArg } from '@fullcalendar/core'
import CustomHeader from '@/components/custom-header'
import { ExpandedEventModal } from '@/components/expanded-event-modal'
import { ExpandableEvent } from '@/components/expandable-event'
import { ModalProvider } from '@/hooks/use-modal'
import { useEvents } from '@/hooks/use-events'
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

export default function AppHome() {
  const {
    events,
    refetchEvents,
    isRangeCached,
    setCurrentStart,
    setCurrentEnd,
    currentEnd,
    currentStart,
  } = useEvents()

  const calendarRef = useRef<FullCalendar>(null)

  const handleDatesSet = useCallback(
    async (arg: DatesSetArg) => {
      const start = arg.startStr
      const end = arg.endStr

      if (start !== currentStart || end !== currentEnd) {
        setCurrentStart(start)
        setCurrentEnd(end)

        if (!isRangeCached(start, end)) {
          await refetchEvents(start, end)
        }
      }
    },
    [
      isRangeCached,
      refetchEvents,
      setCurrentEnd,
      setCurrentStart,
      currentStart,
      currentEnd,
    ],
  )

  const handleUpdateEvent = async (
    event: EventDropArg | EventResizeDoneArg,
  ) => {
    const eventData = {
      id: event.event.id,
      start: event.event.start,
      end: event.event.end,
      summary: event.event.title,
      attendees: event.event.extendedProps.attendees,
      description: event.event.extendedProps.description,
    }

    await fetch('/api/calendar/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    toast('Event updated')
  }

  return (
    <ModalProvider>
      <div className="h-[calc(100vh-64px)] sm:h-screen overflow-auto px-4 pt-4 sm:p-4 flex flex-col gap-2">
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
          editable={true}
          eventDrop={handleUpdateEvent}
          eventResize={handleUpdateEvent}
        />

        <ExpandedEventModal />
      </div>
    </ModalProvider>
  )
}
