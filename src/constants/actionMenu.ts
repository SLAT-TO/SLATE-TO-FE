/** ActionMenu 고정 액션 — Figma 기준 edit/delete/leave, 라벨은 ACTION_MENU_LABELS에서 관리 */
export const ACTION_MENU_ACTIONS = ['edit', 'delete', 'leave'] as const
export type ActionMenuAction = (typeof ACTION_MENU_ACTIONS)[number]

export const ACTION_MENU_LABELS: Record<ActionMenuAction, string> = {
  edit: '수정하기',
  delete: '삭제하기',
  leave: '나가기',
}

export interface ActionMenuItem {
  action: ActionMenuAction
  onClick: () => void
  disabled?: boolean
  /** ACTION_MENU_LABELS 기본 라벨을 이 항목에서만 다르게 표시하고 싶을 때 (예: 프로젝트 설정 메뉴의 "설정") */
  label?: string
}
