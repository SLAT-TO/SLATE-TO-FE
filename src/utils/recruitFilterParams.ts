import { ONBOARDING_REGION_OPTIONS } from '../constants/regions'
import { VIDEO_CATEGORY_OPTIONS, FILM_LENGTH_OPTIONS } from '../constants/videoCategories'
import { ROLE_OPTIONS } from '../constants/roles'
import type { SelectedFilters } from '../types/Recruit.types'
import type { RecruitmentListParams } from '../api/recruitments'

/** 한글 라벨 목록 → BE enum 값 목록 (매칭 안 되는 라벨은 제외) */
function toValues(
  labels: string[],
  options: ReadonlyArray<{ value: string; label: string }>,
): string[] {
  return labels
    .map((label) => options.find((o) => o.label === label)?.value)
    .filter((value): value is string => Boolean(value))
}

/** 화면 필터(한글 라벨) → 서버 쿼리 파라미터(BE enum) */
export function toRecruitmentListParams(filters: SelectedFilters): RecruitmentListParams {
  const params: RecruitmentListParams = {}

  const location = toValues(filters.region, ONBOARDING_REGION_OPTIONS)
  if (location.length) params.location = location

  // '영상' 필터는 유형·길이 두 그룹이 한 키에 담기므로 각각 분리해 보낸다
  const category = toValues(filters.videoType, VIDEO_CATEGORY_OPTIONS)
  if (category.length) params.category = category

  // 장편·단편은 상호배타 + BE가 단일값만 받음
  const lengthType = toValues(filters.videoType, FILM_LENGTH_OPTIONS)
  if (lengthType.length) params.lengthType = lengthType[0]

  const recruitPart = toValues(filters.role, ROLE_OPTIONS)
  if (recruitPart.length) params.recruitPart = recruitPart

  return params
}
