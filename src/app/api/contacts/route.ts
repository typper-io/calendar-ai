import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { endOfMonth, startOfMonth } from 'date-fns'
import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const oauth2Client = new google.auth.OAuth2()

    oauth2Client.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const monthStart = startOfMonth(new Date())
    const monthEnd = endOfMonth(new Date())

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: monthStart.toISOString(),
      timeMax: monthEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const allEventsAttendees = response.data.items?.map((event) => {
      return event.attendees?.map((attendee) => attendee.email)
    })

    const allAttendees = allEventsAttendees?.flat().filter((email) => email)

    const allUniqueAttendees = Array.from(new Set(allAttendees))

    return NextResponse.json({ contacts: allUniqueAttendees })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch events' })
  }
}
