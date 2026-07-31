export type ProjectNotice = {
  id: number
  projectId: number
  title: string
  content: string
  writerId: number
  writerNickname: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export type ProjectNoticeListItem = {
  id: number
  title: string
  content: string
  writer: { id: number; nickname: string }
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export type CreateNoticeRequest = {
  title: string
  content: string
}

export type UpdateNoticeRequest = Partial<CreateNoticeRequest>
