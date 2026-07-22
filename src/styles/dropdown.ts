/** Select·ActionMenu 드롭다운 패널/항목 공통 스타일 */

export const DROPDOWN_PANEL_BASE =
  'bg-bg-primary rounded-lg divide-y divide-neutral-3 shadow-[var(--shadow-panel)]'

export const DROPDOWN_PANEL_POSITION = 'absolute z-10 mt-1'

export const DROPDOWN_ITEM_BASE =
  'text-caption-lg flex h-10 w-full items-center justify-center text-neutral-10 transition-colors hover:bg-neutral-2'

export const selectPanelClass = `${DROPDOWN_PANEL_BASE} ${DROPDOWN_PANEL_POSITION} max-h-60 w-full overflow-auto`

export const actionMenuPanelClass = `${DROPDOWN_PANEL_BASE} ${DROPDOWN_PANEL_POSITION} top-full right-0 min-w-[200px] overflow-hidden`

export const selectOptionClass = `${DROPDOWN_ITEM_BASE} cursor-pointer`

export const actionMenuItemClass = `${DROPDOWN_ITEM_BASE} focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-4`
