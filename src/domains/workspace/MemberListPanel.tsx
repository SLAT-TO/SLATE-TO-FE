import { useCallback, useEffect, useRef, useState } from 'react'
import { removeMember, updateMemberRole } from '../../api/projects'
import ActionMenu from '../../components/ActionMenu'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import Choice from '../../components/Choice'
import ConfirmModal from '../../components/ConfirmModal'
import { ROLE_OPTIONS, roleLabel } from '../../constants/roles'
import { CARD_BASE } from '../../styles/card'
import { ApiError } from '../../types/api'
import type { MemberSummary } from '../../types/project'
import InviteLinkModal from './InviteLinkModal'

interface MemberListPanelProps {
  projectId: number
  members: MemberSummary[]
  isAdmin: boolean
  meId: number | null
  avatarSize?: number
  /** 아바타 옆 라벨 (영상 상세: 참여 인원) */
  label?: string
  onMembersChange: (members: MemberSummary[]) => void
  /** 외부에서 참여 인원 패널을 열 때 */
  panelOpen?: boolean
  onPanelOpenChange?: (open: boolean) => void
  /** 외부에서 초대 모달을 열 때 (영상 헤더 +초대) */
  inviteOpen?: boolean
  onInviteOpenChange?: (open: boolean) => void
}

export default function MemberListPanel({
  projectId,
  members,
  isAdmin,
  meId,
  avatarSize = 33,
  label,
  onMembersChange,
  panelOpen: panelOpenProp,
  onPanelOpenChange,
  inviteOpen: inviteOpenProp,
  onInviteOpenChange,
}: MemberListPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalPanelOpen, setInternalPanelOpen] = useState(false)
  const [manageMode, setManageMode] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [savingRoles, setSavingRoles] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<MemberSummary | null>(null)
  const [internalInviteOpen, setInternalInviteOpen] = useState(false)
  const [actionError, setActionError] = useState('')

  const inviteOpen = inviteOpenProp ?? internalInviteOpen
  const panelOpen = panelOpenProp ?? internalPanelOpen
  const setPanelOpen = useCallback((next: boolean) => {
    if (onPanelOpenChange) onPanelOpenChange(next)
    else setInternalPanelOpen(next)
  }, [onPanelOpenChange])
  const setInviteOpen = (next: boolean) => {
    if (onInviteOpenChange) onInviteOpenChange(next)
    else setInternalInviteOpen(next)
  }

  useEffect(() => {
    if (!panelOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      // ConfirmModal은 portal이라 패널 밖 — 제거 확인 중에는 닫지 않음
      if (removeTarget != null) return
      if (!containerRef.current?.contains(e.target as Node)) {
        setPanelOpen(false)
        setManageMode(false)
        setEditingMemberId(null)
        setActionError('')
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false)
        setManageMode(false)
        setEditingMemberId(null)
        setActionError('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [panelOpen, removeTarget, setPanelOpen])

  const startEdit = (member: MemberSummary) => {
    setManageMode(false)
    setEditingMemberId(member.memberId)
    setSelectedRoles([...member.roleNames])
    setActionError('')
  }

  const toggleRole = (role: string, checked: boolean) => {
    setSelectedRoles((prev) =>
      checked ? (prev.includes(role) ? prev : [...prev, role]) : prev.filter((r) => r !== role),
    )
  }

  const saveRoles = async (memberId: number) => {
    if (selectedRoles.length === 0) return
    setSavingRoles(true)
    setActionError('')
    try {
      const updated = await updateMemberRole(projectId, memberId, selectedRoles)
      onMembersChange(
        members.map((m) => (m.memberId === memberId ? { ...m, roleNames: updated.roleNames } : m)),
      )
      setEditingMemberId(null)
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : '역할을 저장하지 못했습니다. 다시 시도해주세요.',
      )
    } finally {
      setSavingRoles(false)
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    const targetId = removeTarget.memberId
    setActionError('')
    try {
      await removeMember(projectId, targetId)
      onMembersChange(members.filter((m) => m.memberId !== targetId))
      setRemoveTarget(null)
    } catch (err) {
      setRemoveTarget(null)
      setActionError(
        err instanceof ApiError ? err.message : '팀원을 제거하지 못했습니다. 다시 시도해주세요.',
      )
    }
  }

  const canRemove = (member: MemberSummary) =>
    member.permission !== 'ADMIN' && (meId == null || member.userId !== meId)

  const previewMembers = members.slice(0, 4)

  return (
    <div
      ref={containerRef}
      className={`relative flex shrink-0 items-center ${label ? 'gap-4' : ''}`}
    >
      {label && <span className="text-caption-lg text-neutral-11 font-semibold">{label}</span>}

      <button
        type="button"
        onClick={() => setPanelOpen(!panelOpen)}
        aria-label="참여 목록 열기"
        aria-expanded={panelOpen}
        className="flex -space-x-2"
      >
        {previewMembers.length === 0 ? (
          <span className="text-caption-lg text-neutral-6">참여자 없음</span>
        ) : (
          previewMembers.map((member) => (
            <Avatar
              key={member.memberId}
              src={member.profileImageUrl ?? undefined}
              alt={member.nickname}
              size={avatarSize}
              fallback={member.nickname.slice(0, 1)}
              border="gray"
              className="bg-neutral-2"
            />
          ))
        )}
      </button>

      {panelOpen && (
        <div
          className={`absolute top-full right-0 z-20 mt-2 flex w-[320px] flex-col gap-4 p-4 ${CARD_BASE}`}
          role="dialog"
          aria-label="참여 목록"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-head-sm text-neutral-11 font-bold">참여 목록</h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setManageMode((v) => !v)
                  setEditingMemberId(null)
                  setActionError('')
                }}
                className="text-caption-lg text-neutral-6 font-semibold"
              >
                {manageMode ? '완료' : '관리'}
              </button>
            )}
          </div>

          {actionError ? (
            <p className="text-warning text-caption-lg" role="alert">
              {actionError}
            </p>
          ) : null}

          <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
            {members.map((member) => {
              const isEditing = editingMemberId === member.memberId
              return (
                <li key={member.memberId} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.profileImageUrl ?? undefined}
                      alt={member.nickname}
                      size={36}
                      fallback={member.nickname.slice(0, 1)}
                      border="gray"
                      className="bg-neutral-2"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm text-neutral-11 truncate font-semibold">
                        {member.nickname}
                      </p>
                      {!isEditing && (
                        <p className="text-caption-sm text-neutral-6 truncate">
                          {member.roleNames.length > 0
                            ? member.roleNames.map(roleLabel).join(', ')
                            : '역할 없음'}
                        </p>
                      )}
                    </div>

                    {manageMode ? (
                      canRemove(member) ? (
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(member)}
                          className="text-caption-lg text-neutral-6 shrink-0 font-semibold"
                        >
                          제거
                        </button>
                      ) : null
                    ) : isAdmin ? (
                      <ActionMenu
                        items={[{ action: 'edit', onClick: () => startEdit(member) }]}
                        ariaLabel={`${member.nickname} 메뉴`}
                      />
                    ) : null}
                  </div>

                  {isEditing && isAdmin && (
                    <div className="border-neutral-3 ml-12 flex flex-col gap-2 rounded-lg border p-3">
                      <p className="text-caption-lg text-neutral-6">역할을 선택해주세요</p>
                      <p className="text-caption-sm text-neutral-5">*복수선택 가능</p>
                      <div className="flex flex-col gap-2">
                        {ROLE_OPTIONS.map((option) => (
                          <Choice
                            key={option.value}
                            type="checkbox"
                            checked={selectedRoles.includes(option.value)}
                            onChange={(checked) => toggleRole(option.value, checked)}
                            label={option.label}
                            value={option.value}
                          />
                        ))}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        disabled={selectedRoles.length === 0 || savingRoles}
                        onClick={() => void saveRoles(member.memberId)}
                      >
                        {savingRoles ? '저장 중…' : '저장'}
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setPanelOpen(false)
              setInviteOpen(true)
            }}
          >
            게스트 초대하기
          </Button>
        </div>
      )}

      <InviteLinkModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={projectId}
      />

      <ConfirmModal
        isOpen={removeTarget != null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemove()}
        title="팀원을 제거할까요?"
        description={
          removeTarget ? `${removeTarget.nickname}님을 프로젝트에서 제거합니다.` : undefined
        }
        confirmText="제거"
      />
    </div>
  )
}
