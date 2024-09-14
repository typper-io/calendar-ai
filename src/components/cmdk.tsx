'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { CalendarIcon, Sparkle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useChat } from '@/hooks/use-chat'
import { useCommandK } from '@/hooks/use-command'
import CustomMentionsInput, {
  TextSegment,
} from '@/components/ui/mentions-input'
import { useEvents } from '@/hooks/use-events'

export function CommandK() {
  const { setChatOpen } = useChat()
  const { commandKOpen, setCommandKOpen } = useCommandK()
  const [segments, setSegments] = useState<TextSegment[]>([])
  const { refetchEvents } = useEvents()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandKOpen(!commandKOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandKOpen, setCommandKOpen])

  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<
    {
      id: string
      display: string
    }[]
  >([])

  const items = [
    {
      title: 'Open Calendar',
      icon: <CalendarIcon size={16} />,
    },
  ]

  const [filteredItems, setFilteredItems] = useState<any[]>(items)

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await fetch('/api/contacts')

      if (!response.ok) {
        return toast('Failed to fetch contacts.')
      }

      const data = await response.json()
      setContacts(
        data.contacts.map((email: string) => ({ id: email, display: email })),
      )
    }

    fetchContacts()
  }, [])

  const handleInputChange = (value: string) => {
    setFilteredItems(items.filter((item) => customFilter(item.title, value)))
  }

  const customFilter = (value: string, search: string, keywords?: string[]) => {
    if (!search) return 1

    if (value === 'Ask assistant') {
      return 1
    }

    if (value === 'Schedule event') {
      return 1
    }

    if (keywords?.includes('event_details')) {
      return 1
    }

    return value.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      ? 1
      : 0
  }

  const handleCreateEvent = async () => {
    if (loading) return

    setInputValue('')
    setLoading(true)

    const summary = segments
      .filter((segment) => segment.type === 'normal')
      .map((segment) => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')

    const start =
      segments.find((segment) => segment.type === 'date')?.value || new Date()

    const end = new Date(
      new Date(start).getTime() + 60 * 60 * 1000,
    ).toISOString()

    const attendees = segments.filter((segment) => segment.type === 'email')

    const eventData = {
      summary: summary,
      start: start,
      end: end,
      attendees: attendees.map((attendee) => ({ email: attendee.value })),
    }

    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      setLoading(false)

      return toast('Failed to create event.')
    }

    await refetchEvents()

    setCommandKOpen(false)
    setLoading(false)
    toast('Event has been created.')
  }

  return (
    <CommandDialog open={commandKOpen} onOpenChange={setCommandKOpen}>
      <div className="flex items-center border-b p-3">
        <CustomMentionsInput
          users={contacts}
          onChange={handleInputChange}
          segments={segments}
          setSegments={setSegments}
          placeholder="Type a command or search..."
        />
      </div>

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleCreateEvent} className="gap-2">
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CalendarIcon size={16} />
            )}
            <span>Schedule event</span>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              setCommandKOpen(false)
              setChatOpen(inputValue)
              setInputValue('')
            }}
            className="gap-2"
          >
            <Sparkle size={16} />
            <span>Ask assistant</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {filteredItems.length > 0 && (
          <CommandGroup heading="Suggestions">
            {filteredItems.map((item) => (
              <CommandItem key={item.title} className="gap-2">
                {item.icon}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
