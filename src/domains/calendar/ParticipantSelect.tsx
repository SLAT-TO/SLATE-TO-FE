import { useEffect, useRef, useState } from 'react'
import InlineIcon from '../../components/InlineIcon'
import { Avatar } from '../../components/Avatar'
import type { MemberSummary } from '../../types/project'
import { DROPDOWN_PANEL_BASE } from '../../styles/dropdown'
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import checkboxIcon from '../../assets/icons/checkbox.svg?raw'
import xIcon from '../../assets/icons/x.svg?raw'

interface ParticipantSelectProps {
  members: MemberSummary[]
  loading: boolean
  disabled?: boolean
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

const TRIGGER_CLASS =
  'text-body-sm flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-border-input bg-neutral-2 px-4 text-left transition-colors outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60'

// "참여 인원" 선택 — 선택된 프로젝트의 실제 멤버 목록에서 여러 명을 고른다. 고른 사람은 트리거 아래에 칩으로 나열된다.
export function ParticipantSelect({
  members,
  loading,
  disabled,
  selectedIds,
  onChange,
}: ParticipantSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  const selectedMembers = members.filter((m) => selectedIds.includes(String(m.userId)))
  const label = loading ? '불러오는 중…' : '참여 인원을 선택하세요.'

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={TRIGGER_CLASS}
      >
        <span className="text-neutral-5 truncate">{label}</span>
        <InlineIcon
          svg={chevronDownIcon}
          className={`text-neutral-5 size-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className={`${DROPDOWN_PANEL_BASE} mt-1 max-h-60 w-full overflow-auto`}
        >
          {members.length === 0 && (
            <li className="text-caption-lg text-neutral-5 flex h-10 items-center justify-center">
              멤버가 없습니다
            </li>
          )}
          {members.map((member) => {
            const id = String(member.userId)
            const checked = selectedIds.includes(id)
            return (
              <li key={id} role="option" aria-selected={checked}>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="hover:bg-neutral-2 flex h-10 w-full items-center justify-between gap-2 px-4 transition-colors"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar
                      src={member.profileImageUrl ?? undefined}
                      alt={member.nickname}
                      size={20}
                      fallback={member.nickname.slice(0, 1)}
                    />
                    <span className="text-caption-lg text-neutral-10 truncate">
                      {member.nickname}
                    </span>
                  </span>
                  {checked && (
                    <InlineIcon svg={checkboxIcon} className="text-primary size-4 shrink-0" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selectedMembers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedMembers.map((member) => {
            const id = String(member.userId)
            return (
              <div
                key={id}
                className="border-neutral-5 flex w-37.5 items-center gap-3 rounded border-[0.75px] p-2"
              >
                <Avatar
                  src={member.profileImageUrl ?? undefined}
                  alt={member.nickname}
                  size={36}
                  fallback={member.nickname.slice(0, 1)}
                />
                <span className="text-body-sm text-neutral-10 flex-1 truncate font-semibold tracking-[-0.32px] capitalize">
                  {member.nickname}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`${member.nickname} 제외`}
                  className="shrink-0"
                >
                  <InlineIcon svg={xIcon} className="text-neutral-10 size-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
