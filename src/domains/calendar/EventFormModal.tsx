import { useEffect, useState } from 'react'
import { getProjectMembers } from '../../api/projects'
import { Button } from '../../components/Button'
import { DateRangeField } from '../../components/DateRangeField'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Select from '../../components/Select'
import type { MemberSummary } from '../../types/project'
import type { CalendarFilterOption } from './CalendarFilterMenu'
import { ParticipantSelect } from './ParticipantSelect'

export interface EventFormValues {
  title: string
  startDate: Date | null
  endDate: Date | null
  projectId: string
  participantIds: string[]
  /** participantIds에 대응하는 닉네임 — "대상" 표시용 (제출 시점의 멤버 목록으로 계산) */
  participantNames: string[]
  place: string
  memo: string
}

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: EventFormValues) => void
  /** 모달을 연 시점의 선택된 날짜 — 기간 시작일 기본값 (수정 모드에서는 initialValues가 우선) */
  initialDate?: Date | null
  /** 관련 프로젝트 선택지 — 실제 프로젝트 목록은 부모(CalendarPage)가 소유. lockedProjectId가 있으면 쓰이지 않는다 */
  projectOptions?: ReadonlyArray<CalendarFilterOption>
  /** 있으면 "일정 수정" 모드로 이 값들을 채워서 연다 */
  initialValues?: EventFormValues
  /** 특정 프로젝트 안(워크스페이스 일정 탭)에서 열 때 — "관련 프로젝트" 선택 필드를 숨기고 이 값으로 고정한다 */
  lockedProjectId?: string
}

const EMPTY_VALUES = (initialDate?: Date | null, projectId = ''): EventFormValues => ({
  title: '',
  startDate: initialDate ?? null,
  endDate: null,
  projectId,
  participantIds: [],
  participantNames: [],
  place: '',
  memo: '',
})

const LABEL_CLASS = 'text-body-sm text-neutral-10 font-semibold capitalize'

// "일정 추가/수정" 팝업. 필드는 전부 이 모달이 소유하고, 확인 시 값을 부모(CalendarPage)에 통째로 넘긴다.
export function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  projectOptions = [],
  initialValues,
  lockedProjectId,
}: EventFormModalProps) {
  const isEditMode = !!initialValues
  // 부모가 열릴 때마다 새로 마운트해준다는 전제 하에 초기값만 계산 — 재오픈 시 자동으로 최신 initialDate/initialValues로 리셋됨
  const [values, setValues] = useState<EventFormValues>(
    () => initialValues ?? EMPTY_VALUES(initialDate, lockedProjectId),
  )

  // 선택된 프로젝트의 실제 멤버 목록 — "참여 인원"에서 고를 후보
  const [members, setMembers] = useState<MemberSummary[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadMembers() {
      if (!values.projectId) {
        setMembers([])
        return
      }
      setMembersLoading(true)
      try {
        const result = await getProjectMembers(Number(values.projectId))
        if (!cancelled) setMembers(result.items)
      } catch {
        if (!cancelled) setMembers([])
      } finally {
        if (!cancelled) setMembersLoading(false)
      }
    }

    void loadMembers()
    return () => {
      cancelled = true
    }
  }, [values.projectId])

  const handleSubmit = () => {
    const participantNames = members
      .filter((m) => values.participantIds.includes(String(m.memberId)))
      .map((m) => m.nickname)
    onSubmit({ ...values, participantNames })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="flex max-h-180 w-220 flex-col overflow-y-auto px-24 py-12"
    >
      <h2 className="text-head-sm text-neutral-10 mb-8 font-bold capitalize">
        {isEditMode ? '일정 수정' : '일정 추가'}
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className={LABEL_CLASS}>일정명</span>
          <Input
            value={values.title}
            onChange={(title) => setValues((v) => ({ ...v, title }))}
            placeholder="일정명을 입력해주세요."
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className={LABEL_CLASS}>기간</span>
          <DateRangeField
            value={{ from: values.startDate ?? undefined, to: values.endDate ?? undefined }}
            onChange={(range) =>
              setValues((v) => ({
                ...v,
                startDate: range?.from ?? null,
                endDate: range?.to ?? null,
              }))
            }
          />
        </div>

        {!lockedProjectId && (
          <div className="flex flex-col gap-3">
            <span className={LABEL_CLASS}>관련 프로젝트 (선택)</span>
            <Select
              options={projectOptions}
              value={values.projectId}
              onChange={(projectId) =>
                setValues((v) =>
                  projectId ? { ...v, projectId } : { ...v, projectId, participantIds: [] },
                )
              }
              placeholder="프로젝트를 선택해주세요."
            />
          </div>
        )}

        {values.projectId && (
          <div className="flex flex-col gap-3">
            <span className={LABEL_CLASS}>참여 인원 (선택)</span>
            <ParticipantSelect
              members={members}
              loading={membersLoading}
              selectedIds={values.participantIds}
              onChange={(participantIds) => setValues((v) => ({ ...v, participantIds }))}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <span className={LABEL_CLASS}>장소 (선택)</span>
          <Input
            value={values.place}
            onChange={(place) => setValues((v) => ({ ...v, place }))}
            placeholder="장소를 입력하세요."
          />
        </div>

        <div className="flex flex-col gap-3">
          <span className={LABEL_CLASS}>메모 (선택)</span>
          <Input
            value={values.memo}
            onChange={(memo) => setValues((v) => ({ ...v, memo }))}
            placeholder="메모를 입력하세요."
          />
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-4">
        <Button variant="primary" size="sm" className="w-60" onClick={handleSubmit}>
          확인
        </Button>
        <Button variant="secondary" size="sm" className="w-60" onClick={onClose}>
          취소
        </Button>
      </div>
    </Modal>
  )
}
