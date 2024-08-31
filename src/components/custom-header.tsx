import { FC, RefObject, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import FullCalendar from '@fullcalendar/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'

interface CustomHeaderProps {
  calendarRef: RefObject<FullCalendar>
}

const CustomHeader: FC<CustomHeaderProps> = ({ calendarRef }) => {
  const [showToday, setShowToday] = useState(false)

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

  function goNext() {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.next()
  }

  function goPrev() {
    const calendarApi = calendarRef.current?.getApi()
    calendarApi?.prev()
  }

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

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-muted-foreground">
        Calendar {'>'} {formatTitle()}
      </h2>

      <div className="flex gap-2 items-center">
        {showToday && (
          <Button
            onClick={goToday}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Today
          </Button>
        )}

        <div className="flex gap-1 items-center">
          <Button onClick={goPrev} variant="ghost" size="sm">
            <ChevronLeft />
          </Button>

          <Button onClick={goNext} variant="ghost" size="sm">
            <ChevronRight />
          </Button>
        </div>

        <Tabs
          tabs={['Month', 'Week', 'Day']}
          defaultTab="Week"
          onTabChange={changeTab}
        />
      </div>
    </div>
  )
}

export default CustomHeader
