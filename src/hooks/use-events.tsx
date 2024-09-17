import { create } from 'zustand'
import { EventInput } from '@fullcalendar/core'
import { toast } from 'sonner'

type State = {
  events: EventInput[]
  currentStart: string
  currentEnd: string
  cachedRanges: { start: string; end: string }[]
}

type Actions = {
  setEvents: (events: EventInput[]) => void
  setCachedRanges: (cachedRanges: { start: string; end: string }[]) => void
  refetchEvents: (start?: string, end?: string) => Promise<void>
  isRangeCached: (start: string, end: string) => boolean
  setCurrentStart: (currentStart: string) => void
  setCurrentEnd: (currentEnd: string) => void
}

export const useEvents = create<State & Actions>((set, get) => ({
  events: [],
  cachedRanges: [],
  currentStart: '',
  currentEnd: '',
  setCurrentStart: (currentStart) => set({ currentStart }),
  setCurrentEnd: (currentEnd) => set({ currentEnd }),
  setEvents: (events) => set({ events }),
  setCachedRanges: (cachedRanges) => set({ cachedRanges }),
  refetchEvents: async (start?: string, end?: string) => {
    try {
      const { currentEnd, currentStart, cachedRanges } = get()

      const rangesToFetch =
        start && end
          ? [{ start, end }]
          : cachedRanges.length > 0
            ? cachedRanges
            : [{ start: currentStart, end: currentEnd }]

      let newEvents: EventInput[] = []

      for (const range of rangesToFetch) {
        const response = await fetch(
          `/api/calendar/events?start=${range.start}&end=${range.end}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }

        const data = await response.json()
        newEvents = [...newEvents, ...data.events]
      }

      set((state) => {
        const updatedEvents = [...state.events]
        newEvents.forEach((newEvent) => {
          const index = updatedEvents.findIndex((e) => e.id === newEvent.id)
          if (index !== -1) {
            updatedEvents[index] = newEvent
          } else {
            updatedEvents.push(newEvent)
          }
        })
        return { events: updatedEvents }
      })

      if (start && end) {
        set((state) => {
          const updatedRanges = [...state.cachedRanges]
          const newRange = { start, end }
          if (
            !updatedRanges.some(
              (range) => range.start === start && range.end === end,
            )
          ) {
            updatedRanges.push(newRange)
          }
          return { cachedRanges: updatedRanges }
        })
      }
    } catch (error) {
      toast('Failed to fetch events')
    }
  },
  isRangeCached: (start: string, end: string) => {
    return get().cachedRanges.some(
      (range) => range.start <= start && range.end >= end,
    )
  },
}))
