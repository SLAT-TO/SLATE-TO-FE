const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

let loadPromise: Promise<void> | null = null

/** YouTube IFrame Player API 스크립트를 한 번만 로드한다 */
export function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve()
      }

      if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
        const script = document.createElement('script')
        script.src = IFRAME_API_SRC
        script.async = true
        document.head.appendChild(script)
      }
    })
  }

  return loadPromise
}
