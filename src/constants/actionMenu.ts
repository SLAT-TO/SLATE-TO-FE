/** ActionMenu 고정 액션 — Figma 기준 edit/delete, 라벨은 ACTION_MENU_LABELS에서 관리 */
export const ACTION_MENU_ACTIONS = ['edit', 'delete'] as const
export type ActionMenuAction = (typeof ACTION_MENU_ACTIONS)[number]

export const ACTION_MENU_LABELS: Record<ActionMenuAction, string> = {
  edit: '수정하기',
  delete: '삭제하기',
}

export interface ActionMenuItem {
  action: ActionMenuAction
  onClick: () => void
  disabled?: boolean
}
