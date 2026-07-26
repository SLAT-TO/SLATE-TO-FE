import type { RecruitmentDetail } from '../../types/Recruit.types'

const BASE = {
  type: '외주',
  category: '단편영화',
  status: '모집 중' as const,
  dDay: 'D-3',
  createdAt: '2026.05.04 15:24',
  viewCount: 15,
  recruitPart: '촬영 감독',
  shootingRegion: '서울',
  videoType: '단편영화',
  videoLength: '단편',
  pay: '일일 10만원',
  participationPeriod: '2026.05.20 ~ 2026.06.02',
  deadline: '2026.05.15',
  contact: 'soomin.kim@example.com',
  description: '상세 설명',
  author: {
    userId: 1,
    name: '김수민',
    role: '연출자',
    region: '서울',
    email: 'soomin.kim@example.com',
    profileImageUrl: 'https://placehold.co/56x56',
  },
}

// API 연동 시 제거 — GET /recruitments/:id
export const MOCK_JOB_DETAILS: RecruitmentDetail[] = [
  { ...BASE, id: 101, isOwner: false, title: '공고 제목' },
  { ...BASE, id: 301, isOwner: true, title: '내가 올린 공고' },
  { ...BASE, id: 302, isOwner: true, title: '내가 올린 공고' },
]
