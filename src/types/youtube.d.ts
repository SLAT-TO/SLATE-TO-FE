/** YouTube IFrame Player API — v2 seekTo/getCurrentTime 연동용 최소 타입 */
declare global {
  namespace YT {
    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions)
      destroy(): void
      seekTo(seconds: number, allowSeekAhead?: boolean): void
      getCurrentTime(): number
      getDuration(): number
      getPlayerState(): number
      loadVideoById(videoId: string): void
      playVideo(): void
      pauseVideo(): void
      mute(): void
      unMute(): void
      isMuted(): boolean
    }

    interface PlayerOptions {
      videoId?: string
      width?: string | number
      height?: string | number
      playerVars?: PlayerVars
      events?: PlayerEvents
    }

    interface PlayerVars {
      rel?: 0 | 1
      modestbranding?: 0 | 1
      controls?: 0 | 1
    }

    interface PlayerEvents {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: PlayerStateChangeEvent) => void
    }

    interface PlayerEvent {
      target: Player
    }

    interface PlayerStateChangeEvent {
      target: Player
      data: number
    }

    const PlayerState: {
      UNSTARTED: -1
      ENDED: 0
      PLAYING: 1
      PAUSED: 2
      BUFFERING: 3
      CUED: 5
    }
  }

  interface Window {
    YT?: {
      Player: typeof YT.Player
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export {}
