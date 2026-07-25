export type FilterCategory = 'region' | 'videoType' | 'role'

export type SelectedFilters = Record<FilterCategory, string[]>

export interface SelectedFilterChip {
  category: FilterCategory
  value: string
}

export interface FilterGroup {
  label: string
  options: string[]
  /** 패널 안에서 이 그룹이 차지할 비중 */
  span?: 'wide' | 'narrow'
  /** 없으면 항상 노출 */
  showWhen?: (selectedInCategory: string[]) => boolean
}

export interface FilterConfig {
  key: FilterCategory
  buttonLabel: string
  groups: FilterGroup[]
}

export interface JobPost {
  id: number
  type: string
  category: string
  title: string
  description: string
  role: string
  price?: string
  dDay: string
}
