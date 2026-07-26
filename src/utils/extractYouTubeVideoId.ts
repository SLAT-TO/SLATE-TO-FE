const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

/** 11자리 videoId 또는 youtube.com / youtu.be URL에서 videoId 추출. 실패 시 null */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (VIDEO_ID_PATTERN.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return VIDEO_ID_PATTERN.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v')
      if (v && VIDEO_ID_PATTERN.test(v)) return v

      const pathMatch = url.pathname.match(/\/(?:embed|shorts|v)\/([a-zA-Z0-9_-]{11})/)
      if (pathMatch) return pathMatch[1]
    }
  } catch {
    return null
  }

  return null
}
