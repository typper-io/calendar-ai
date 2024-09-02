'use server'

import { generateId } from 'ai'
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  StreamableValue,
} from 'ai/rsc'
import { OpenAI } from 'openai'
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/api/auth/[...nextauth]/authOptions'
import { google } from 'googleapis'
import { EventInput } from '@fullcalendar/core/index.js'
import { Message } from '@/components/message'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ClientMessage {
  id: string
  status: ReactNode
  text: ReactNode
  gui: ReactNode
  threadIdStream?: StreamableValue<string, any>
}

const ASSISTANT_ID = process.env.ASSISTANT_ID

export async function submitMessage(
  question: string,
  threadId: string,
): Promise<ClientMessage> {
  try {
    let runId = ''

    const session = await getServerSession(authOptions)

    if (!session || !session.accessToken) {
      return {
        id: generateId(),
        status: '',
        text: 'Not authenticated',
        gui: null,
      }
    }

    const oauth2Client = new google.auth.OAuth2()

    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    })

    const status = createStreamableUI('thread.init')
    const textStream = createStreamableValue('')
    const textUIStream = createStreamableUI(
      <Message textStream={textStream.value} />,
    )
    const gui = createStreamableUI()
    const threadIdStream = createStreamableValue(threadId)

    const runQueue = []

    ;(async () => {
      if (threadId) {
        await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: question,
        })

        let additional_instructions = ''

        additional_instructions += `<current_time>${new Date().toISOString()}</current_time>`
        additional_instructions += `<current_user>${session.user?.name}</current_user>`

        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID!,
          stream: true,
          additional_instructions,
        })

        runQueue.push({ id: generateId(), run })
      } else {
        const run = await openai.beta.threads.createAndRun({
          assistant_id: ASSISTANT_ID!,
          stream: true,
          thread: {
            messages: [{ role: 'user', content: question }],
          },
        })

        runQueue.push({ id: generateId(), run })
      }

      while (runQueue.length > 0) {
        const latestRun = runQueue.shift()

        if (latestRun) {
          for await (const delta of latestRun.run) {
            const { data, event } = delta

            status.update(event)

            if (event === 'thread.created') {
              threadIdStream.update(data.id)
              threadId = data.id
            } else if (event === 'thread.run.created') {
              runId = data.id
            } else if (event === 'thread.message.delta') {
              data.delta.content?.map((part: any) => {
                if (part.type === 'text') {
                  if (part.text) {
                    textStream.append(part.text.value)
                  }
                }
              })
            } else if (event === 'thread.run.requires_action') {
              if (data.required_action) {
                if (data.required_action.type === 'submit_tool_outputs') {
                  try {
                    const { tool_calls } =
                      data.required_action.submit_tool_outputs
                    const tool_outputs = []

                    for (const tool_call of tool_calls) {
                      const { id: toolCallId, function: fn } = tool_call
                      const { name, arguments: args } = fn

                      try {
                        if (name === 'get_calendar') {
                          const { start_time, end_time, calendar_id } =
                            JSON.parse(args)

                          const start = new Date(start_time).toISOString()
                          const end = new Date(end_time).toISOString()

                          const response = await calendar.events.list({
                            calendarId: calendar_id,
                            timeMin: start,
                            timeMax: end,
                            singleEvents: true,
                            orderBy: 'startTime',
                          })

                          const events: EventInput[] = response.data.items!.map(
                            (event) => ({
                              id: event.id!,
                              title: event.summary || 'Busy',
                              start:
                                event.start?.dateTime! || event.start?.date!,
                              end: event.end?.dateTime! || event.end?.date!,
                              allDay: !event.start?.dateTime,
                              extendedProps: {
                                description: event.description || '',
                                attendees:
                                  event.attendees?.map(
                                    (attendee) => attendee.email,
                                  ) || [],
                                recurrence: event.recurrence || [],
                                hangoutLink: event.hangoutLink || '',
                                videoConferenceLink:
                                  event.conferenceData?.entryPoints?.find(
                                    (ep) => ep.entryPointType === 'video',
                                  )?.uri || '',
                                responseStatus: event.status,
                              },
                            }),
                          )

                          gui.append(<></>)

                          tool_outputs.push({
                            tool_call_id: toolCallId,
                            output: JSON.stringify(events),
                          })

                          continue
                        }

                        if (name === 'schedule_event') {
                          const {
                            start_time,
                            end_time,
                            summary,
                            description,
                            all_day,
                            attendees,
                            recurrence,
                            time_zone,
                          } = JSON.parse(args)

                          const eventTimeZone =
                            time_zone || 'America/Los_Angeles'

                          const start = new Date(start_time).toISOString()
                          const end = new Date(end_time).toISOString()

                          const result = await calendar.events.insert({
                            calendarId: 'primary',
                            requestBody: {
                              summary,
                              description,
                              start: {
                                dateTime: all_day ? undefined : start,
                                date: all_day ? start.split('T')[0] : undefined,
                                timeZone: eventTimeZone,
                              },
                              end: {
                                dateTime: all_day ? undefined : end,
                                date: all_day ? end.split('T')[0] : undefined,
                                timeZone: eventTimeZone,
                              },
                              attendees: attendees?.map((email: string) => ({
                                email,
                              })),
                              recurrence,
                            },
                          })

                          gui.append(<></>)

                          tool_outputs.push({
                            tool_call_id: toolCallId,
                            output: JSON.stringify(result.data),
                          })

                          continue
                        }

                        if (name === 'edit_event') {
                          const {
                            start_time,
                            end_time,
                            summary,
                            description,
                            all_day,
                            attendees,
                            recurrence,
                            event_id,
                          } = JSON.parse(args)

                          const start =
                            start_time && new Date(start_time).toISOString()
                          const end =
                            end_time && new Date(end_time).toISOString()

                          const result = await calendar.events.update({
                            calendarId: 'primary',
                            eventId: event_id,
                            requestBody: {
                              summary,
                              description,
                              start: {
                                dateTime: all_day ? undefined : start,
                                date: all_day ? start.split('T')[0] : undefined,
                              },
                              end: {
                                dateTime: all_day ? undefined : end,
                                date: all_day ? end.split('T')[0] : undefined,
                              },
                              attendees: attendees?.map((email: string) => ({
                                email,
                              })),
                              recurrence,
                            },
                          })

                          gui.append(<></>)

                          tool_outputs.push({
                            tool_call_id: toolCallId,
                            output: JSON.stringify(result.data),
                          })

                          continue
                        }

                        if (name === 'delete_event') {
                          const { event_id } = JSON.parse(args)

                          const result = await calendar.events.delete({
                            calendarId: 'primary',
                            eventId: event_id,
                          })

                          gui.append(<></>)

                          tool_outputs.push({
                            tool_call_id: toolCallId,
                            output: JSON.stringify(result.data),
                          })

                          continue
                        }
                      } catch (error: any) {
                        tool_outputs.push({
                          tool_call_id: toolCallId,
                          output: JSON.stringify({ error: error.message }),
                        })
                      }
                    }

                    const nextRun: any =
                      await openai.beta.threads.runs.submitToolOutputs(
                        threadId,
                        runId,
                        {
                          tool_outputs,
                          stream: true,
                        },
                      )

                    runQueue.push({ id: generateId(), run: nextRun })
                  } catch (error: any) {
                    status.done()
                    textUIStream.done()
                    gui.done()
                    threadIdStream.done()
                  }
                }
              }
            }
          }
        }
      }

      status.done()
      textUIStream.done()
      gui.done()
      threadIdStream.done()
    })()

    return {
      id: generateId(),
      status: status.value,
      text: textUIStream.value,
      gui: gui.value,
      threadIdStream: threadIdStream.value,
    }
  } catch (error: any) {
    return {
      id: generateId(),
      status: 'Failed to submit message',
      text: error.message,
      gui: null,
    }
  }
}

export const AI = createAI({
  actions: { submitMessage },
})
