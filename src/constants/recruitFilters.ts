import { VIDEO_CATEGORY_LABELS, FILM_LENGTH_LABELS } from './videoCategories'
import { ROLE_LABELS } from './roles'
import type { FilterConfig } from '../types/Recruit.types'

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신 순' },
  { value: 'deadline', label: '마감 임박 순' },
  { value: 'popular', label: '인기 순' },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

/** 장편·단편 그룹을 노출시키는 트리거 카테고리 */
export const FILM_LENGTH_TRIGGER = '영화 / 드라마'

/**
 * 장편·단편 그룹 노출 조건.
 * TODO: 디자이너 확인 — 항상 노출이면 `() => true`로 교체
 */
export const shouldShowFilmLength = (selectedVideoTypes: string[]) =>
  selectedVideoTypes.includes(FILM_LENGTH_TRIGGER)

// 필터에서는 '기타' 제외 (피그마 패널에 없음)
const VIDEO_FILTER_OPTIONS = VIDEO_CATEGORY_LABELS.filter((label) => label !== '기타')
const ROLE_FILTER_OPTIONS = ROLE_LABELS.filter((label) => label !== '기타')

export const REGION_LABELS = [
  '서울시',
  '경기도',
  '강원도',
  '충청남도',
  '충청북도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주도',
] as const

export const FILTER_CONFIGS: FilterConfig[] = [
  {
    key: 'region',
    buttonLabel: '지역',
    groups: [{ label: '지역 선택', options: [...REGION_LABELS] }],
  },
  {
    key: 'videoType',
    buttonLabel: '영상',
    groups: [
      { label: '영상 유형 선택', span: 'wide', options: [...VIDEO_FILTER_OPTIONS] },
      {
        label: '영상 유형 선택',
        span: 'narrow',
        options: [...FILM_LENGTH_LABELS],
        showWhen: shouldShowFilmLength,
      },
    ],
  },
  {
    key: 'role',
    buttonLabel: '역할',
    groups: [{ label: '역할 선택', options: [...ROLE_FILTER_OPTIONS] }],
  },
]
