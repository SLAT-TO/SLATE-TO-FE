import { useCallback, useEffect, useRef, useState } from 'react'
import { removeMember, updateMemberRole } from '../../api/projects'
import { getShareLink, getShareLinkGuests } from '../../api/videos'
import ActionMenu from '../../components/ActionMenu'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import Choice from '../../components/Choice'
import ConfirmModal from '../../components/ConfirmModal'
import { ROLE_OPTIONS, roleLabel } from '../../constants/roles'
import { CARD_BASE } from '../../styles/card'
import { ApiError } from '../../types/api'
import type { GuestSummary } from '../../types/feedback'
import type { MemberSummary } from '../../types/project'
import InviteLinkModal from './InviteLinkModal'
import ShareLinkModal from './ShareLinkModal'

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
  /** 영상 상세에서만 전달 — 있으면 "게스트 초대하기" 버튼이 이 영상으로 바로 뜬다 */
  videoId?: number
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
  videoId,
}: MemberListPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalPanelOpen, setInternalPanelOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [savingRoles, setSavingRoles] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<MemberSummary | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [guestInviteOpen, setGuestInviteOpen] = useState(false)
  const [actionError, setActionError] = useState('')

  const [guests, setGuests] = useState<GuestSummary[]>([])
  const [guestsLoaded, setGuestsLoaded] = useState(false)
  const [guestsLoading, setGuestsLoading] = useState(false)

  const panelOpen = panelOpenProp ?? internalPanelOpen
  const setPanelOpen = useCallback(
    (next: boolean) => {
      if (onPanelOpenChange) onPanelOpenChange(next)
      else setInternalPanelOpen(next)
    },
    [onPanelOpenChange],
  )

  useEffect(() => {
    if (!panelOpen) return

    const handlePointerDown = (e: PointerEvent) => {
      // ConfirmModal은 portal이라 패널 밖 — 제거 확인 중에는 닫지 않음
      if (removeTarget != null) return
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      // ActionMenu의 드롭다운(수정·제거)도 document.body에 포탈로 뜨기 때문에 containerRef
      // 밖에 있다 — 그 클릭까지 "패널 바깥 클릭"으로 잡으면 항목을 누르는 순간 패널 전체가
      // 먼저 닫혀버려 수정 UI가 뜨지 않는다.
      if (target instanceof Element && target.closest('[role="menu"]')) return
      setPanelOpen(false)
      setEditingMemberId(null)
      setActionError('')
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelOpen(false)
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

  /** 게스트는 영상 단위 공유 링크에 딸려있어 videoId가 있을 때만 조회 가능 — 프로젝트
   * 대시보드(videoId 없음)에서는 어떤 영상 기준인지가 없어 목록 자체를 보여줄 수 없다. */
  useEffect(() => {
    if (!panelOpen || videoId == null || guestsLoaded) return
    let cancelled = false

    async function loadGuests(id: number) {
      setGuestsLoading(true)
      try {
        const link = await getShareLink(id)
        const list = await getShareLinkGuests(id, link.shareLinkId)
        if (cancelled) return
        setGuests(list.guests)
      } catch (err) {
        if (cancelled) return
        // 공유 링크를 아직 한 번도 안 만들었으면(게스트 초대 이력 없음) 빈 목록으로 취급.
        // 현재 BE는 SHARELINK404, 구형 mock은 COMMON404를 반환하므로 둘 다 허용한다.
        if (
          !(err instanceof ApiError) ||
          (err.code !== 'SHARELINK404' && err.code !== 'COMMON404')
        ) {
          setActionError('게스트 목록을 불러오지 못했습니다.')
        }
        setGuests([])
      } finally {
        if (!cancelled) {
          setGuestsLoaded(true)
          setGuestsLoading(false)
        }
      }
    }

    void loadGuests(videoId)
    return () => {
      cancelled = true
    }
  }, [panelOpen, videoId, guestsLoaded])

  const startEdit = (member: MemberSummary) => {
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
          className={`absolute top-full right-0 z-20 mt-2 flex w-[calc(100vw-32px)] max-w-[320px] flex-col gap-4 p-4 ${CARD_BASE}`}
          role="dialog"
          aria-label="참여 목록"
        >
          <h2 className="text-head-sm text-neutral-11 font-bold">참여 목록</h2>

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

                    {isAdmin && (
                      <ActionMenu
                        items={[
                          { action: 'edit', onClick: () => startEdit(member) },
                          ...(canRemove(member)
                            ? [
                                {
                                  action: 'delete' as const,
                                  label: '제거',
                                  onClick: () => setRemoveTarget(member),
                                },
                              ]
                            : []),
                        ]}
                        ariaLabel={`${member.nickname} 메뉴`}
                      />
                    )}
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

          {/* 게스트는 영상 단위 공유 링크에 딸린 별도 신원이라 팀원과 관리 방식이 다름(역할 없음).
           * 프로젝트 대시보드에서는 기준이 되는 영상이 없어 이 섹션 자체를 보여주지 않는다. */}
          {videoId != null && (
            <div className="border-neutral-3 flex flex-col gap-2 border-t pt-3">
              <h3 className="text-caption-lg text-neutral-8 font-semibold">
                게스트{guests.length > 0 ? ` ${guests.length}` : ''}
              </h3>
              {guestsLoading ? (
                <p className="text-caption-lg text-neutral-6">불러오는 중…</p>
              ) : guests.length === 0 ? (
                <p className="text-caption-lg text-neutral-6">게스트가 없습니다.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {guests.map((guest) => (
                    <li key={guest.guestId} className="flex items-center gap-3">
                      <Avatar
                        alt={guest.name}
                        size={28}
                        fallback={guest.name.slice(0, 1)}
                        border="gray"
                        className="bg-neutral-2"
                      />
                      <p className="text-caption-lg text-neutral-10 truncate">{guest.name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setPanelOpen(false)
                  setInviteOpen(true)
                }}
              >
                프로젝트 초대하기
              </Button>
              {/* 게스트 초대는 영상 단위 공유 링크라, 지금 보고 있는 영상이 있을 때만 바로 만들 수 있다 */}
              {videoId != null && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setPanelOpen(false)
                    setGuestInviteOpen(true)
                  }}
                >
                  게스트 초대하기
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <InviteLinkModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={projectId}
      />

      {videoId != null && (
        <ShareLinkModal
          isOpen={guestInviteOpen}
          onClose={() => {
            setGuestInviteOpen(false)
            // 공유 링크를 새로 만들었을 수 있으니 다음에 열 때(또는 지금 열려 있으면 바로) 게스트 목록을 다시 불러온다
            setGuestsLoaded(false)
          }}
          videoId={videoId}
        />
      )}

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
