import type { UserCategory, UserRole } from './user'

export type PortfolioKind = 'PERSONAL' | 'EXTERNAL'

export type Portfolio = {
  id: number
  title: string
  type: UserCategory | 'ETC' | string
  kind: PortfolioKind
  clientName: string | null
  roles: UserRole[]
  description: string
  comment: string | null
  youtubeUrl: string
  thumbnailUrl: string | null
}

export type CreatePortfolioRequest = {
  title: string
  type: string
  customTypeName?: string
  kind: PortfolioKind
  clientName?: string
  roles: UserRole[]
  description: string
  comment?: string
  youtubeUrl: string
}

export type UpdatePortfolioRequest = Partial<CreatePortfolioRequest>

export type PageResult<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
