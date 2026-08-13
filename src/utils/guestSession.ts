const guestSessionKey = (shareToken: string) => `slate_guest_session:${shareToken}`

export type GuestSession = {
  guestId: number
  sessionToken: string
}

export function getGuestSession(shareToken: string): GuestSession | null {
  const serialized = localStorage.getItem(guestSessionKey(shareToken))
  if (!serialized) return null

  try {
    const session = JSON.parse(serialized) as Partial<GuestSession>
    if (typeof session.guestId !== 'number' || !session.sessionToken) return null
    return { guestId: session.guestId, sessionToken: session.sessionToken }
  } catch {
    localStorage.removeItem(guestSessionKey(shareToken))
    return null
  }
}

export function setGuestSession(shareToken: string, session: GuestSession): void {
  localStorage.setItem(guestSessionKey(shareToken), JSON.stringify(session))
}
