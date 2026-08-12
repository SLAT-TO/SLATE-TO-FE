import { VIDEO_CATEGORY_LABELS, FILM_LENGTH_LABELS } from './videoCategories'
import { ROLE_LABELS } from './roles'
import type { FilterConfig } from '../types/Recruit.types'

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신 순' },
  { value: 'deadline', label: '마감 임박 순' },
  { value: 'popular', label: '인기 순' },
] as const

/** FE 정렬값 → BE sort 파라미터 */
export const SORT_PARAM: Record<SortValue, string> = {
  latest: 'LATEST',
  deadline: 'DEADLINE',
  popular: 'POPULAR',
}

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

// 필터에서는 '기타' 제외 (피그마 패널에 없음)
const VIDEO_FILTER_OPTIONS = VIDEO_CATEGORY_LABELS.filter((label) => label !== '기타')
const ROLE_FILTER_OPTIONS = ROLE_LABELS.filter((label) => label !== '기타')

export const REGION_LABELS = [
  '서울시',
  '경기도 / 인천',
  '강원도',
  '충청남도',
  '충청북도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주도',
] as const

export const REGION_OPTIONS: ReadonlyArray<{ value: string; label: string }> = REGION_LABELS.map(
  (label) => ({ value: label, label }),
)

export const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'region',
    buttonLabel: '지역',
    groups: [{ label: '지역 선택', columns: 5, options: [...REGION_LABELS] }],
  },
  {
    key: 'videoType',
    buttonLabel: '영상',
    groups: [
      { label: '영상 유형 선택', span: 'wide', columns: 4, options: [...VIDEO_FILTER_OPTIONS] },
      {
        label: '영상 길이 선택',
        span: 'narrow',
        single: true,
        options: [...FILM_LENGTH_LABELS],
      },
    ],
  },
  {
    key: 'role',
    buttonLabel: '역할',
    groups: [{ label: '역할 선택', columns: 5, options: [...ROLE_FILTER_OPTIONS] }],
  },
]
