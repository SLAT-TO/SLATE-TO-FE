import type { JobPost } from '../../types/Recruit.types'

// API 연동 시 제거 — GET /jobs/recommended
export const MOCK_RECOMMENDED_POSTS: JobPost[] = [
  {
    id: 1,
    type: '외주',
    category: '단편영화',
    title: '독립 단편영화 <안녕, 봄> 촬영 감독 모집',
    description: '프로젝트 소개글',
    role: '촬영 감독',
    price: '일일 10만원',
    dDay: 'D-2',
  },
  {
    id: 2,
    type: '외주',
    category: '단편영화',
    title: '독립 단편영화 <안녕, 봄> 촬영 감독 모집',
    description: '프로젝트 소개글',
    role: '촬영 감독',
    price: '일일 10만원',
    dDay: 'D-2',
  },
]

// TODO: API 연동 시 제거 — GET /jobs
export const MOCK_JOB_POSTS: JobPost[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 101,
  type: '외주',
  category: '단편영화',
  title: '독립 단편영화 <안녕, 봄> 촬영 감독 모집',
  description: '프로젝트 소개글',
  role: '촬영 감독',
  price: '일일 10만원',
  dDay: 'D-2',
}))
