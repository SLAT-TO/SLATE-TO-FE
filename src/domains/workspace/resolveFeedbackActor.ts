/** 워크스페이스 피드백/답글 — Swagger: guest만 guestId, 멤버는 JWT */
export async function resolveFeedbackActor(guestId?: number): Promise<{
  guestId?: number
}> {
  if (guestId != null) return { guestId }
  return {}
}
