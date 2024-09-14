import { calendar_v3, google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { EventInput } from '@fullcalendar/core'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 },
      )
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2()

    oauth2Client.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start,
      timeMax: end,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events: EventInput[] = response.data.items!.map((event) => ({
      id: event.id!,
      title: event.summary || 'Busy',
      start: event.start?.dateTime! || event.start?.date!,
      end: event.end?.dateTime! || event.end?.date!,
      allDay: !event.start?.dateTime,
      extendedProps: {
        description: event.description || '',
        attendees: event.attendees?.map((attendee) => attendee.email) || [],
        recurrence: event.recurrence || [],
        hangoutLink: event.hangoutLink || '',
        videoConferenceLink:
          event.conferenceData?.entryPoints?.find(
            (ep) => ep.entryPointType === 'video',
          )?.uri || '',
        responseStatus:
          event.attendees?.find((attendee) => attendee.self)?.responseStatus ||
          'accepted',
      },
    }))

    return NextResponse.json({ events })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch events' })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const eventData = await request.json()

    if (!eventData.summary || !eventData.start || !eventData.end) {
      return NextResponse.json(
        { error: 'Summary, start, and end are required' },
        { status: 400 },
      )
    }

    const oauth2Client = new google.auth.OAuth2()

    oauth2Client.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const eventBody: calendar_v3.Schema$Event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'UTC',
      },
      attendees: eventData.attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }

    if (eventData.attendees && eventData.attendees.length > 0) {
      eventBody.conferenceData = {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      }
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventBody,
      conferenceDataVersion: 1,
    })

    return NextResponse.json({ event: response.data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create event' })
  }
}
