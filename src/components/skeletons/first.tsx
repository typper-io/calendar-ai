'use client'

import React, { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  CalendarIcon,
  Clock,
  Loader2,
  Mail,
  Pen,
  SparkleIcon,
} from 'lucide-react'
import chrono from 'chrono-node'
import { toast } from 'sonner'

export const SkeletonOne = () => {
  const [inputValue, setInputValue] = useState('')
  const [foundTime, setFoundTime] = useState<Record<string, any> | null>(null)
  const [foundEmails, setFoundEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const items = [
    {
      title: 'Open Calendar',
      icon: <CalendarIcon size={16} />,
    },
  ]

  const [filteredItems, setFilteredItems] = useState<any[]>(items)

  const findEmails = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = text.match(emailRegex) || []
    return Array.from(new Set(emails))
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    const parsedDates = chrono.parse(value)
    setFoundTime(parsedDates.length > 0 ? parsedDates[0] : null)
    setFoundEmails(findEmails(value))
    setFilteredItems(items.filter((item) => customFilter(item.title, value)))
  }

  const getEventTitle = () => {
    return inputValue
      .replace(foundTime?.text || '', '')
      .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '')
      .trim()
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

    return value.includes(search) ? 1 : 0
  }

  const handleCreateEvent = async () => {
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast('Demo event created successfully!')
    setLoading(false)
  }

  return (
    <Command className="border" shouldFilter={false} loop>
      <CommandInput
        placeholder="Type a command or search..."
        onValueChange={handleInputChange}
        value={inputValue}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              setInputValue('')
            }}
            className="gap-2 data-[selected='true']:bg-accent"
          >
            <SparkleIcon size={16} />
            <span>Ask assistant</span>
          </CommandItem>

          <CommandItem
            onSelect={handleCreateEvent}
            className="gap-2 data-[selected='true']:bg-accent"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <CalendarIcon size={16} />
            )}
            <span>Schedule event</span>
          </CommandItem>
        </CommandGroup>

        {(foundTime || foundEmails.length > 0) && (
          <CommandGroup heading="Event Details">
            {foundTime && (
              <CommandItem className="gap-2 data-[selected='true']:bg-accent">
                <Clock size={16} />
                <span>{`${foundTime.start?.date().toLocaleString()}  ${foundTime.end ? `- ${foundTime.end.date().toLocaleString()}` : ''}`}</span>
              </CommandItem>
            )}
            {foundEmails.map((email, index) => (
              <CommandItem
                key={index}
                className="gap-2 data-[selected='true']:bg-accent"
              >
                <Mail size={16} />
                <span>{email}</span>
              </CommandItem>
            ))}
            {getEventTitle() && (
              <CommandItem className="gap-2 data-[selected='true']:bg-accent">
                <Pen size={16} />
                <span>{getEventTitle()}</span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {filteredItems.length > 0 && (
          <CommandGroup heading="Suggestions">
            {filteredItems.map((item) => (
              <CommandItem
                key={item.title}
                className="gap-2 data-[selected='true']:bg-accent"
              >
                {item.icon}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
