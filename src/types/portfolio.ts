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

/** GET /users/{userId}/portfolios — 카드 렌더링용 요약본 (상세 필드 없음) */
export type PortfolioSummary = {
  id: number
  title: string
  type: UserCategory | 'ETC' | string
  customTypeName: string | null
  roles: UserRole[]
  thumbnailUrl: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
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
  items: T[]
  nextCursor: number | null
  hasNext: boolean
}
