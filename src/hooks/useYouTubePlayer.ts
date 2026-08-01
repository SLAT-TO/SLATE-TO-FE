import { useCallback, useEffect, useRef, useState } from 'react'

/** 영상 상세의 YouTube 플레이어 재생/음소거/탐색/시간 상태를 다루는 훅 */
export function useYouTubePlayer() {
  const playerRef = useRef<YT.Player | null>(null)
  const playerWrapperRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const syncCurrentTime = useCallback((seconds: number) => {
    currentTimeRef.current = seconds
    setCurrentTime(seconds)
  }, [])

  /** 피드백 시간 첨부용 — React state(재생 중 250ms 폴링)가 아니라 플레이어 실제 시각을 읽음 */
  const getCurrentTime = useCallback(() => {
    const live = playerRef.current?.getCurrentTime()
    if (typeof live === 'number' && Number.isFinite(live)) {
      currentTimeRef.current = live
      return live
    }
    return currentTimeRef.current
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const p = playerRef.current
      if (!p) return
      const t = p.getCurrentTime()
      if (typeof t === 'number' && Number.isFinite(t)) syncCurrentTime(t)
    }, 250)
    return () => clearInterval(id)
  }, [isPlaying, syncCurrentTime])

  const handlePlayerReady = useCallback(
    (player: YT.Player) => {
      playerRef.current = player
      setDuration(player.getDuration())
      const t = player.getCurrentTime()
      if (typeof t === 'number' && Number.isFinite(t)) syncCurrentTime(t)
    },
    [syncCurrentTime],
  )

  const handleStateChange = useCallback(
    (event: YT.PlayerStateChangeEvent) => {
      setIsPlaying(event.data === 1)
      const p = playerRef.current
      if (!p) return
      const t = p.getCurrentTime()
      if (typeof t === 'number' && Number.isFinite(t)) syncCurrentTime(t)
      const d = p.getDuration()
      if (d) setDuration(d)
    },
    [syncCurrentTime],
  )

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (isPlaying) p.pauseVideo()
    else p.playVideo()
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (isMuted) {
      p.unMute()
      setIsMuted(false)
    } else {
      p.mute()
      setIsMuted(true)
    }
  }, [isMuted])

  /** 플레이어 탐색 + 진행바/시간 표시 상태를 함께 갱신 — 둘 중 하나만 하면 화면이 실제 재생 위치와 어긋남 */
  const seekTo = useCallback(
    (seconds: number) => {
      playerRef.current?.seekTo(seconds, true)
      syncCurrentTime(seconds)
    },
    [syncCurrentTime],
  )

  const handleSeekClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
      seekTo(fraction * duration)
    },
    [duration, seekTo],
  )

  return {
    playerWrapperRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    getCurrentTime,
    handlePlayerReady,
    handleStateChange,
    togglePlay,
    toggleMute,
    seekTo,
    handleSeekClick,
  }
}
