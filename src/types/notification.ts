export type AppNotification = {
  id: number
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  link: string | null
}

export type UnreadCountResult = {
  count: number
}
