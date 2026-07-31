import YouTubeIframePlayer from '../../components/YouTubeIframePlayer'
import type { useYouTubePlayer } from '../../hooks/useYouTubePlayer'
import { formatTimestamp } from './videoDetailFormat'
import { ExpandIcon, PauseIcon, PlayIcon, VolumeIcon } from './videoDetailShared'

type VideoPlayerSectionProps = Pick<
  ReturnType<typeof useYouTubePlayer>,
  | 'playerWrapperRef'
  | 'isPlaying'
  | 'isMuted'
  | 'currentTime'
  | 'duration'
  | 'handlePlayerReady'
  | 'handleStateChange'
  | 'togglePlay'
  | 'toggleMute'
  | 'handleSeekClick'
> & {
  youtubeUrl: string
  title: string
}

export default function VideoPlayerSection({
  playerWrapperRef,
  youtubeUrl,
  title,
  isPlaying,
  isMuted,
  currentTime,
  duration,
  handlePlayerReady,
  handleStateChange,
  togglePlay,
  toggleMute,
  handleSeekClick,
}: VideoPlayerSectionProps) {
  return (
    <div
      ref={playerWrapperRef}
      className="group relative w-full overflow-hidden rounded-[10px] bg-black"
      style={{ aspectRatio: '752 / 360' }}
    >
      <YouTubeIframePlayer
        videoIdOrUrl={youtubeUrl}
        title={title}
        hideControls
        onReady={handlePlayerReady}
        onStateChange={handleStateChange}
        className="h-full max-w-none"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        <div
          onClick={handleSeekClick}
          className="h-1 w-full cursor-pointer rounded-full bg-white/30"
        >
          <div
            className="h-full rounded-full bg-white"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex items-center gap-3 text-white">
          <button type="button" onClick={togglePlay} className="shrink-0">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" onClick={toggleMute} className="shrink-0">
            <VolumeIcon muted={isMuted} />
          </button>
          <span className="text-caption-sm rounded-full bg-black/40 px-3 py-1">
            {formatTimestamp(currentTime)}/{formatTimestamp(duration)}
          </span>
          <button
            type="button"
            onClick={() => playerWrapperRef.current?.requestFullscreen?.()}
            className="ml-auto shrink-0"
          >
            <ExpandIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
