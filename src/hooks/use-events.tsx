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
      const { currentEnd, currentStart } = get()

      const fetchStart = start || currentStart
      const fetchEnd = end || currentEnd

      if (!fetchStart || !fetchEnd) {
        return
      }

      const response = await fetch(
        `/api/calendar/events?start=${fetchStart}&end=${fetchEnd}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()

      const newEvents = data.events.filter(
        (newEvent: EventInput) =>
          !get().events.some(
            (existingEvent: EventInput) => existingEvent.id === newEvent.id,
          ),
      )

      set((state) => ({ events: [...state.events, ...newEvents] }))
      if (start && end) {
        set((state) => ({
          cachedRanges: [...state.cachedRanges, { start, end }],
        }))
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
