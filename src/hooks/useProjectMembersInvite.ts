import { useCallback, useState } from 'react'
import { getProjectMembers } from '../api/projects'
import type { MemberSummary } from '../types/project'

/** 프로젝트 참여 인원 목록 로딩 + 초대 링크 복사를 다루는 훅 */
export function useProjectMembersInvite(projectId: number) {
  const [members, setMembers] = useState<MemberSummary[]>([])

  const load = useCallback(async () => {
    const list = await getProjectMembers(projectId).catch(() => ({
      items: [] as MemberSummary[],
      memberCount: 0,
    }))
    setMembers(list.items)
    return list.items
  }, [projectId])

  /** 참여 인원 초대 — BE가 내려준 inviteUrl을 클립보드에 복사 */
  /** 초대 링크 생성만 수행 — Modal에서 URL 표시 후 복사할 때 사용 */
  return { members, setMembers, load }
}
