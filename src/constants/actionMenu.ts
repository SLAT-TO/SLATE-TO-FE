/** ActionMenu 고정 액션 — Figma 기준 edit/delete에 settings(설정 이동)·leave(권한 없는 멤버의 나가기)를 추가, 라벨은 ACTION_MENU_LABELS에서 관리 */
export const ACTION_MENU_ACTIONS = ['edit', 'delete', 'settings', 'leave'] as const
export type ActionMenuAction = (typeof ACTION_MENU_ACTIONS)[number]

export const ACTION_MENU_LABELS: Record<ActionMenuAction, string> = {
  edit: '수정하기',
  delete: '삭제하기',
  settings: '설정',
  leave: '나가기',
}

export interface ActionMenuItem {
  action: ActionMenuAction
  onClick: () => void
  disabled?: boolean
}
