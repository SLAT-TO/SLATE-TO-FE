import { getMe } from '../../api/users'

/** 워크스페이스 피드백/답글 — BE actor XOR (guestId | userId) */
export async function resolveFeedbackActor(guestId?: number): Promise<{
  userId?: number
  guestId?: number
}> {
  if (guestId != null) return { guestId }
  const me = await getMe()
  return { userId: me.id }
}

export async function resolveMemberUserId(): Promise<number> {
  const me = await getMe()
  return me.id
}
