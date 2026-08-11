import { authHandlers } from './auth'
import { notificationHandlers } from './notifications'
import { projectHandlers } from './projects'
import { recruitmentHandlers } from './recruitments'
import { scheduleHandlers } from './schedules'
import { userHandlers } from './users'
import { videoHandlers } from './videos'
/* import 하는 함수들이 배열 형태로 전달되므로 스프레드 연산자(...)로 배열을 해제하여 하나의 handlers라는 배열로 재조립 */
export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...projectHandlers,
  ...videoHandlers,
  ...recruitmentHandlers,
  ...scheduleHandlers,
  ...notificationHandlers,
]

// 스프레드 연산자가 없으면 [[1], [2], [3]] 형태의 2차원 배열 형태가 됨
