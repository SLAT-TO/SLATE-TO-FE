import type { SelectedFilters, FilterCategory } from '../types/Recruit.types'
import { FILTER_CONFIGS, SORT_OPTIONS, type SortValue } from '../constants'

const DEFAULT_SORT: SortValue = 'latest'

/** URL 쿼리 → 화면 필터. FILTER_CONFIGS에 없는 값은 걸러낸다
 *  (오래된 북마크·수동 편집 URL로 들어온 값이 칩에만 뜨고 목록엔 반영되지 않는 상태 방지) */
export function parseFilters(params: URLSearchParams): SelectedFilters {
  const allowed = (key: FilterCategory): string[] => {
    const options = FILTER_CONFIGS.find((config) => config.key === key)?.groups.flatMap(
      (group) => group.options,
    )
    return params.getAll(key).filter((value) => options?.includes(value) ?? false)
  }

  return {
    region: allowed('region'),
    videoType: allowed('videoType'),
    role: allowed('role'),
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
