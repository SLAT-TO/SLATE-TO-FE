import type { SelectedFilters } from '../types/Recruit.types'
import { FILTER_CONFIGS, SORT_OPTIONS, type SortValue } from '../constants'

const DEFAULT_SORT: SortValue = 'latest'

/** URL 쿼리 → 화면 필터. 알 수 없는 값은 무시한다 */
export function parseFilters(params: URLSearchParams): SelectedFilters {
  return {
    region: params.getAll('region'),
    videoType: params.getAll('videoType'),
    role: params.getAll('role'),
  }
}

export function parseSort(params: URLSearchParams): SortValue {
  const value = params.get('sort')
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortValue) : DEFAULT_SORT
}

/** 화면 필터 → URL 쿼리. 빈 값과 기본 정렬은 넣지 않아 URL을 짧게 유지한다 */
export function toSearchParams(filters: SelectedFilters, sort: SortValue): URLSearchParams {
  const params = new URLSearchParams()
  for (const config of FILTER_CONFIGS) {
    for (const value of filters[config.key]) params.append(config.key, value)
  }
  if (sort !== DEFAULT_SORT) params.set('sort', sort)
  return params
}
