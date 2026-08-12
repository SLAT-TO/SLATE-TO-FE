import type { QueryClient } from '@tanstack/react-query'
import { projectKeys } from './keys'

/**
 * 활동을 만드는 변경 후, 프로젝트 상세·목록 카드·최근 활동 캐시를 함께 갱신한다.
 */
export function invalidateProjectActivityData(
  queryClient: QueryClient,
  projectId: number,
): Promise<void[]> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: projectKeys.activities(projectId) }),
    queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
    queryClient.invalidateQueries({ queryKey: projectKeys.list() }),
  ])
}
