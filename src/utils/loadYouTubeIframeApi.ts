const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'
const LOAD_TIMEOUT_MS = 15000

let loadPromise: Promise<void> | null = null

/** YouTube IFrame Player API 스크립트를 한 번만 로드한다.
 * 스크립트 로드 실패(네트워크·광고 차단)나 타임아웃 시 reject하고 캐시를 비워
 * 다음 호출에서 재시도할 수 있게 한다 — 예전엔 실패해도 콜백이 안 와서 영원히 pending이었음. */
export function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      let settled = false

      const timeoutId = window.setTimeout(() => {
        if (settled) return
        settled = true
        loadPromise = null
        reject(new Error('YouTube IFrame API 로드 시간이 초과되었습니다.'))
      }, LOAD_TIMEOUT_MS)

      window.onYouTubeIframeAPIReady = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        previous?.()
        resolve()
      }

      const existing = document.querySelector<HTMLScriptElement>(`script[src="${IFRAME_API_SRC}"]`)
      const script = existing ?? document.createElement('script')
      script.addEventListener('error', () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        loadPromise = null
        reject(new Error('YouTube IFrame API 스크립트를 불러오지 못했습니다.'))
      })

      if (!existing) {
        script.src = IFRAME_API_SRC
        script.async = true
        document.head.appendChild(script)
      }
    })
  }

  return loadPromise
}
