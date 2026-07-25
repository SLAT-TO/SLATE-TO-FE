export type ProjectNotice = {
  id: number
  projectId: number
  title: string
  content: string
  writerId: number
  writerNickname: string
  createdAt: string
  updatedAt: string
}

export type ProjectNoticeListItem = {
  id: number
  title: string
  content: string
  writer: { id: number; nickname: string }
  createdAt: string
  updatedAt: string
}

export type CreateNoticeRequest = {
  title: string
  content: string
}

export type UpdateNoticeRequest = Partial<CreateNoticeRequest>
