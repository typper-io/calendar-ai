type UpdateEvent = {
  action: 'schedule_event' | 'edit_event' | 'delete_event'
  event_id: string
  payload?: string
}
