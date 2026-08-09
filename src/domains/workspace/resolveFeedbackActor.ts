/** 워크스페이스 피드백/답글 — Swagger: guest만 guestId, 멤버는 JWT */
export function resolveFeedbackActor(guestId?: number): { guestId?: number } {
  if (guestId != null) return { guestId }
  return {}
}
