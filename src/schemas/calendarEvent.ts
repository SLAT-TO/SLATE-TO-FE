import { z } from 'zod'

// 이벤트 데이터 형태. 날짜는 'yyyy-MM-dd' 문자열로 통일.
// 구간(range) 이벤트 — startDate·endDate 둘 다 포함(inclusive). 하루짜리는 startDate === endDate.
export const calendarEventSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  title: z.string().max(50, '일정명은 50자 이하로 입력해주세요.'),
  color: z.string().optional(),
  place: z.string().max(100, '장소는 100자 이하로 입력해주세요.').optional(),
  // 관련 프로젝트 id (문자열로 저장) — 수정 시 참여 인원 후보를 다시 불러오기 위해 필요
  projectId: z.string().optional(),
  // 참여 대상. 표시할 UI만 있고 아직 입력 폼이 없음 — 추후 연동 예정
  target: z.string().max(100, '참여 대상은 100자 이하로 입력해주세요.').optional(),
  // 선택된 프로젝트의 실제 멤버 ID 목록 (MemberSummary.memberId를 문자열로 저장)
  participantIds: z.array(z.string()).optional(),
  // 일정 등록 시 같이 남긴 메모 (공유용)
  memo: z.string().max(500, '메모는 500자 이하로 입력해주세요.').optional(),
  // 나에게만 보이는 개인 참고 메모
  note: z.string().optional(),
  // 수정 가능 여부 (작성자 본인만 true) — /schedules/daily 기반 이벤트에만 실제 값이 채워짐
  canEdit: z.boolean().optional(),
})

export type CalendarEvent = z.infer<typeof calendarEventSchema>
