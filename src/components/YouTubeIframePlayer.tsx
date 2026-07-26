import { useEffect, useRef, useState } from 'react'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'
import { loadYouTubeIframeApi } from '../utils/loadYouTubeIframeApi'

interface YouTubeIframePlayerProps {
  /** 11자리 videoId 또는 youtube.com / youtu.be URL */
  videoIdOrUrl: string
  /** iframe title (a11y). 미전달 시 기본값 */
  title?: string
  className?: string
  /** Player 준비 완료 — v2 Context·seekTo 연동용 */
  onReady?: (player: YT.Player) => void
  /** true면 유튜브 기본 컨트롤을 숨김 (커스텀 컨트롤 오버레이용) */
  hideControls?: boolean
  onStateChange?: (event: YT.PlayerStateChangeEvent) => void
}

const DEFAULT_TITLE = 'YouTube video player'

/** Figma 피드백 상세 embed 영역(4164:920) — 751px · radius ~10px · 16:9 */
const WRAPPER_CLASS = 'aspect-video w-full max-w-[751px] overflow-hidden rounded-[10px]'

const YouTubeIframePlayer = ({
  videoIdOrUrl,
  title = DEFAULT_TITLE,
  className = '',
  onReady,
  hideControls = false,
  onStateChange,
}: YouTubeIframePlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)
  const onStateChangeRef = useRef(onStateChange)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  const videoId = extractYouTubeVideoId(videoIdOrUrl)

  useEffect(() => {
    if (!videoId || !containerRef.current) return

    setIsLoading(true)

    let player: YT.Player | undefined
    let cancelled = false

    void loadYouTubeIframeApi().then(() => {
      if (cancelled || !containerRef.current) return

      player = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: hideControls ? 0 : 1,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return
            setIsLoading(false)
            onReadyRef.current?.(event.target)
          },
          onStateChange: (event) => {
            if (cancelled) return
            onStateChangeRef.current?.(event)
          },
        },
      })
    })

    return () => {
      cancelled = true
      player?.destroy()
    }
  }, [videoId, hideControls])

  if (!videoId) {
    return (
      <div
        role="alert"
        className={`border-border bg-neutral-2 text-neutral-5 text-body-sm flex items-center justify-center border ${WRAPPER_CLASS} ${className}`}
      >
        유효하지 않은 YouTube 링크입니다
      </div>
    )
  }

  return (
    <div className={`${WRAPPER_CLASS} ${className}`} aria-label={title}>
      <div ref={containerRef} className={`size-full ${isLoading ? 'bg-neutral-2' : ''}`} />
    </div>
  )
}

export default YouTubeIframePlayer
