import type { RecruitApplicant } from '../../types/Recruit.types'

// API 연동 시 제거 — GET /recruitments/:id/applications
export const MOCK_APPLICANTS: RecruitApplicant[] = [
  {
    id: 1,
    recruitmentId: 301,
    applicantId: 11,
    applicantName: '김수민',
    applicantProfileImageUrl: 'https://placehold.co/32x32',
    appliedAt: '0000년 0월 0일 00:00',
    introduction: '자기소개 미리보기 멘트가 나오게 됩니다. 길어지면 말줄임 처리가 되어야 합니다.',
    comment: '해당 지원서에 작성한 코멘트입니다.',
    referenceLink: 'https://example.com/portfolio',
    fileName: '포트폴리오.pdf',
    fileUrl: 'https://example.com/files/portfolio.pdf',
  },
  {
    id: 2,
    recruitmentId: 301,
    applicantId: 12,
    applicantName: '유희진',
    applicantProfileImageUrl: 'https://placehold.co/32x32',
    appliedAt: '0000년 0월 0일 00:00',
    introduction: '자기소개 미리보기 멘트가 나오게 됩니다.',
    comment: '해당 지원서에 작성한 코멘트입니다.',
    referenceLink: 'https://example.com/reel',
  },
  {
    id: 3,
    recruitmentId: 301,
    applicantId: 13,
    applicantName: '서정현',
    applicantProfileImageUrl: 'https://placehold.co/32x32',
    appliedAt: '0000년 0월 0일 00:00',
    introduction: '자기소개 미리보기 멘트가 나오게 됩니다.',
    comment: '해당 지원서에 작성한 코멘트입니다.',
  },
]
