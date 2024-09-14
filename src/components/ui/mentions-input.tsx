import React, { useState, useEffect, useCallback, useRef } from 'react'
import chrono from 'chrono-node'
import { cn } from '@/lib/utils'

interface TextSegment {
  text: string
  type: 'normal' | 'date' | 'email' | 'mention'
}

interface User {
  id: string
  display: string
}

interface HighlightComponentProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  type: TextSegment['type']
}

const HighlightComponent: React.FC<HighlightComponentProps> = ({
  children,
  type,
}) => {
  const colorClasses: Record<TextSegment['type'], string> = {
    email: 'bg-primary',
    date: 'bg-secondary-brand',
    mention: 'bg-tertiary-brand',
    normal: '',
  }

  return (
    <span
      className={cn(
        'rounded-md text-primary-foreground p-1 cursor-pointer z-50',
        colorClasses[type],
      )}
    >
      {children}
    </span>
  )
}

interface CustomMentionsInputProps {
  placeholder?: string
  users: User[]
  onChange?: (value: string) => void
  segmentsUpdate?: (segments: Array<TextSegment>) => void
}

const CustomMentionsInput: React.FC<CustomMentionsInputProps> = ({
  placeholder = 'Type your message...',
  users,
  onChange,
  segmentsUpdate,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [segments, setSegments] = useState<TextSegment[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUserIndex, setSelectedUserIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const processText = useCallback(
    (text: string) => {
      const newSegments: TextSegment[] = []
      let remainingText = text

      const patterns: Array<{
        regex: RegExp
        type: TextSegment['type']
      }> = [
        { regex: /@\w+/g, type: 'mention' },
        {
          regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
          type: 'email',
        },
      ]

      while (remainingText.length > 0) {
        let match: {
          text: string
          index: number
          type: TextSegment['type']
        } | null = null
        let earliestIndex = remainingText.length

        const parsedDates = chrono.parse(remainingText)
        if (parsedDates.length > 0) {
          const dateMatch = parsedDates[0]
          if (dateMatch.index < earliestIndex) {
            match = {
              text: dateMatch.text,
              index: dateMatch.index,
              type: 'date',
            }
            earliestIndex = dateMatch.index
          }
        }

        patterns.forEach(({ regex, type }) => {
          regex.lastIndex = 0 // Reset regex state
          const regexMatch = regex.exec(remainingText)
          if (regexMatch && regexMatch.index < earliestIndex) {
            match = { text: regexMatch[0], index: regexMatch.index, type }
            earliestIndex = regexMatch.index
          }
        })

        if (match) {
          if (match.index > 0) {
            newSegments.push({
              text: remainingText.slice(0, match.index),
              type: 'normal',
            })
          }
          newSegments.push({ text: match.text, type: match.type })
          remainingText = remainingText.slice(match.index + match.text.length)
        } else {
          newSegments.push({ text: remainingText, type: 'normal' })
          break
        }
      }

      segmentsUpdate?.(newSegments)

      return newSegments
    },
    [segmentsUpdate],
  )

  useEffect(() => {
    setSegments(processText(inputValue))
  }, [inputValue, processText])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
    setInputValue(e.target.value)
    setCursorPosition(e.target.selectionStart)
    checkForMentionTrigger(e.target.value, e.target.selectionStart)
  }

  const checkForMentionTrigger = (text: string, cursorPos: number) => {
    const lastAtSymbol = text.lastIndexOf('@', cursorPos - 1)
    if (
      lastAtSymbol !== -1 &&
      (lastAtSymbol === 0 || text[lastAtSymbol - 1] === ' ')
    ) {
      const mentionText = text.slice(lastAtSymbol + 1, cursorPos)
      const filtered = mentionText.toLowerCase()
        ? users.filter((user) =>
            user.display.toLowerCase().startsWith(mentionText.toLowerCase()),
          )
        : users
      setFilteredUsers(filtered)
      setShowDropdown(filtered.length > 0)
      setSelectedUserIndex(0)
    } else {
      setShowDropdown(false)
    }
  }

  const handleUserSelect = (user: User) => {
    const lastAtSymbol = inputValue.lastIndexOf('@', cursorPosition - 1)
    const newInputValue =
      inputValue.slice(0, lastAtSymbol) +
      `@${user.display} ` +
      inputValue.slice(cursorPosition)
    setInputValue(newInputValue)
    setShowDropdown(false)
    if (textareaRef.current) {
      const newCursorPosition = lastAtSymbol + user.display.length + 2
      textareaRef.current.setSelectionRange(
        newCursorPosition,
        newCursorPosition,
      )
      setCursorPosition(newCursorPosition)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedUserIndex((prevIndex) =>
            Math.min(prevIndex + 1, filteredUsers.length - 1),
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedUserIndex((prevIndex) => Math.max(prevIndex - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          handleUserSelect(filteredUsers[selectedUserIndex])
          break
        case 'Escape':
          setShowDropdown(false)
          break
      }
    }
  }

  const handleClick = () => {
    textareaRef.current?.focus()
  }

  const renderTextWithCursor = () => {
    let currentPosition = 0
    return segments.map((segment, index) => {
      const segmentContent = []
      for (let i = 0; i < segment.text.length; i++) {
        if (currentPosition === cursorPosition) {
          segmentContent.push(
            <span key={`cursor-${currentPosition}`} className="animate-blink">
              |
            </span>,
          )
        }
        segmentContent.push(segment.text[i])
        currentPosition++
      }
      if (currentPosition === cursorPosition && index === segments.length - 1) {
        segmentContent.push(
          <span key={`cursor-${currentPosition}`} className="animate-blink">
            |
          </span>,
        )
      }
      return segment.type !== 'normal' ? (
        <HighlightComponent type={segment.type} key={index}>
          {segmentContent}
        </HighlightComponent>
      ) : (
        <span key={index}>{segmentContent}</span>
      )
    })
  }

  return (
    <div className="relative min-h-11 w-full rounded-md bg-transparent">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        className="absolute top-0 left-0 w-full h-full opacity-0 resize-none"
        autoFocus
      />
      <div
        onClick={handleClick}
        className="px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-none disabled:cursor-not-allowed disabled:opacity-50 break-words leading-8"
      >
        {inputValue ? (
          renderTextWithCursor()
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      {showDropdown && (
        <div className="absolute bg-background backdrop-blur-sm border rounded shadow-lg z-[99] w-full max-h-[100px] overflow-y-auto overflow-hidden">
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                'px-4 py-2 hover:bg-muted text-muted-foreground cursor-pointer truncate',
                {
                  'bg-muted': index === selectedUserIndex,
                },
              )}
              onClick={() => handleUserSelect(user)}
            >
              {user.display}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomMentionsInput
