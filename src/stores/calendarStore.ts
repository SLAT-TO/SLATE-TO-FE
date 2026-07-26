import { create } from 'zustand'
import type { CalendarEvent } from '../schemas/calendarEvent'

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  removeEvent: (id: string) => void
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
}

// 캘린더 이벤트 상태. 공용 컴포넌트가 아니라 '페이지 레벨'에서 소유한다.
export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
  updateEvent: (id, patch) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
}))
