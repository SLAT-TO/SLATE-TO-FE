import { useCallback, useState } from 'react'
import { createInvitation, getProjectMembers } from '../api/projects'
import type { MemberSummary } from '../types/project'

/** 프로젝트 참여 인원 목록 로딩 + 초대 링크 복사를 다루는 훅 */
export function useProjectMembersInvite(projectId: number) {
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [inviteCopied, setInviteCopied] = useState(false)

  const load = useCallback(async () => {
    const list = await getProjectMembers(projectId).catch(() => ({
      items: [] as MemberSummary[],
      memberCount: 0,
    }))
    setMembers(list.items)
    return list.items
  }, [projectId])

  /** 참여 인원 초대 — BE가 내려준 inviteUrl을 클립보드에 복사 */
  const inviteMember = useCallback(async () => {
    const { inviteUrl } = await createInvitation(projectId)
    await navigator.clipboard.writeText(inviteUrl)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
  }, [projectId])

  return { members, inviteCopied, load, inviteMember }
}
