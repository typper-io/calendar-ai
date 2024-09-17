import { FC, RefObject, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import FullCalendar from '@fullcalendar/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tab, Tabs } from '@/components/ui/tabs'
import { useCallback } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDevice } from '@/hooks/use-device'

interface CustomHeaderProps {
  calendarRef: RefObject<FullCalendar>
}

const CustomHeader: FC<CustomHeaderProps> = ({ calendarRef }) => {
  const [showToday, setShowToday] = useState(false)
  const [active, setActive] = useState<Tab>('Week')
  const { isMobile } = useDevice()

  useEffect(() => {
    const updateShowToday = () => {
      const calendarApi = calendarRef.current?.getApi()
      if (calendarApi) {
        const today = new Date()
        const start = calendarApi.view.activeStart
        const end = calendarApi.view.activeEnd
        setShowToday(today < start || today >= end)
      }
    }

    updateShowToday()

    calendarRef.current?.getApi().on('datesSet', updateShowToday)

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      calendarRef.current?.getApi().off('datesSet', updateShowToday)
    }
  }, [calendarRef])

  const goNext = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.next()
  }, [calendarRef])

  const goPrev = useCallback(() => {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.prev()
  }, [calendarRef])

  function goToday() {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.today()
  }

  function formatTitle() {
    const originalTitle = calendarRef.current?.getApi()?.view?.title

    const formattedTitle = originalTitle?.replace('.', '').replace(' de ', ' ')

    return (
      (formattedTitle?.charAt(0)?.toUpperCase() || '') +
      (formattedTitle?.slice(1) || '')
    )
  }

  function changeTab(tab: string) {
    const tabToView: Record<string, string> = {
      Month: 'dayGridMonth',
      Week: 'timeGridWeek',
      Day: 'timeGridDay',
    }

    const view = tabToView[tab]

    calendarRef.current?.getApi().changeView(view)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goPrev()
      }

      if (e.key === 'ArrowRight') {
        goNext()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [goNext, goPrev])

  useEffect(() => {
    if (isMobile) {
      calendarRef.current?.getApi().changeView('timeGridDay')
      setActive('Day')
    }
  }, [calendarRef, isMobile])

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-muted-foreground">
        Calendar {'>'} {formatTitle()}
      </h2>

      <div className="flex gap-2 items-center">
        {showToday && (
          <TooltipProvider>
            <Tooltip>
              <Button
                asChild
                onClick={goToday}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <TooltipTrigger>Today</TooltipTrigger>
              </Button>

              <TooltipContent className="flex gap-1 items-center justify-center">
                Go to today
                <div className="p-1 bg-accent w-fit h-fit shrink-0 rounded-md aspect-square">
                  T
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="flex gap-1 items-center">
          <TooltipProvider>
            <Tooltip>
              <Button asChild onClick={goPrev} variant="ghost" size="sm">
                <TooltipTrigger>
                  <ChevronLeft />
                </TooltipTrigger>
              </Button>

              <TooltipContent className="flex gap-1 items-center justify-center">
                Previous
                <div className="p-1 bg-accent w-fit h-fit shrink-0 rounded-md aspect-square">
                  <ChevronLeft size={14} />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <Button asChild onClick={goNext} variant="ghost" size="sm">
                <TooltipTrigger>
                  <ChevronRight />
                </TooltipTrigger>
              </Button>

              <TooltipContent className="flex gap-1 items-center justify-center">
                Next
                <div className="p-1 bg-accent w-fit h-fit shrink-0 rounded-md aspect-square">
                  <ChevronRight size={14} />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Tabs
          tabs={['Month', 'Week', 'Day']}
          onTabChange={changeTab}
          active={active}
          setActive={setActive}
        />
      </div>
    </div>
  )
}

export default CustomHeader
