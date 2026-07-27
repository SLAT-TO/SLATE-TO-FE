import type { JobPost } from '../../types/Recruit.types'

const BASE: Omit<JobPost, 'id'> = {
  type: '외주',
  category: '단편영화',
  title: '독립 단편영화 <안녕, 봄> 촬영 감독 모집',
  description: '프로젝트 소개글',
  role: '촬영 감독',
  price: '일일 10만원',
  dDay: 'D-2',
}

// TODO: API 연동 시 제거 — GET /users/me/recruitment-bookmarks
export const MOCK_BOOKMARKED: JobPost[] = Array.from({ length: 6 }, (_, i) => ({
  ...BASE,
  id: 201 + i,
}))

// TODO: API 연동 시 제거 — GET /users/me/recruitments
export const MOCK_MY_POSTS: JobPost[] = Array.from({ length: 2 }, (_, i) => ({
  ...BASE,
  id: 301 + i,
  description: '',
}))

// TODO: API 연동 시 제거 — GET /users/me/applications
export const MOCK_APPLIED: JobPost[] = Array.from({ length: 2 }, (_, i) => ({
  ...BASE,
  id: 401 + i,
}))
