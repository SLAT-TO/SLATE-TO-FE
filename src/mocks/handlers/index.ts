import { authHandlers } from './auth'
import { projectHandlers } from './projects'
import { recruitmentHandlers } from './recruitments'
import { scheduleHandlers } from './schedules'
import { userHandlers } from './users'
import { videoHandlers } from './videos'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...projectHandlers,
  ...videoHandlers,
  ...recruitmentHandlers,
  ...scheduleHandlers,
]
