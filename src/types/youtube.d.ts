/** YouTube IFrame Player API — v2 seekTo/getCurrentTime 연동용 최소 타입 */
declare global {
  namespace YT {
    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions)
      destroy(): void
      seekTo(seconds: number, allowSeekAhead?: boolean): void
      getCurrentTime(): number
      loadVideoById(videoId: string): void
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
    }

    interface PlayerEvents {
      onReady?: (event: PlayerEvent) => void
    }

    interface PlayerEvent {
      target: Player
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
