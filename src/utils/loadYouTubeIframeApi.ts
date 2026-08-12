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

      // 기존에 실패한 태그가 남아있으면 재사용하지 않는다 — 이미 한 번 error가 난
      // <script>는 다시 로드를 시도하지 않아 error 이벤트가 재발생하지 않으므로,
      // 그대로 재사용하면 타임아웃까지 기다렸다가 또 실패하는 무의미한 재시도가 된다.
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${IFRAME_API_SRC}"]`)
      existing?.remove()
      const script = document.createElement('script')

      const fail = (error: Error) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        loadPromise = null
        script.remove()
        reject(error)
      }

      const timeoutId = window.setTimeout(
        () => fail(new Error('YouTube IFrame API 로드 시간이 초과되었습니다.')),
        LOAD_TIMEOUT_MS,
      )

      window.onYouTubeIframeAPIReady = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        previous?.()
        resolve()
      }

      script.addEventListener('error', () =>
        fail(new Error('YouTube IFrame API 스크립트를 불러오지 못했습니다.')),
      )
      script.src = IFRAME_API_SRC
      script.async = true
      document.head.appendChild(script)
    })
  }

  return loadPromise
}
