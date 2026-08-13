import { useState } from 'react'
import Modal from '../../components/Modal'
import { Button } from '../../components/Button'
import Select from '../../components/Select'
import type { VideoListItem } from '../../types/video'

interface GuestVideoPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSelect: (videoId: number) => void
  videos: VideoListItem[]
  loading: boolean
}

/** 게스트 초대는 영상 단위 공유 링크라, 프로젝트 참여 목록에서 시작할 땐 어떤 영상인지부터 골라야 한다. */
export default function GuestVideoPickerModal({
  isOpen,
  onClose,
  onBack,
  onSelect,
  videos,
  loading,
}: GuestVideoPickerModalProps) {
  const [videoId, setVideoId] = useState('')

  const options = videos.map((v) => ({ value: String(v.videoId), label: v.title }))

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80">
        <h2 className="text-head-sm text-neutral-11 text-center font-semibold break-keep">
          어떤 영상 피드백에 초대할까요?
        </h2>

        <div className="mt-4">
          {loading ? (
            <p className="text-caption-lg text-neutral-6 text-center">영상 목록을 불러오는 중…</p>
          ) : options.length === 0 ? (
            <p className="text-caption-lg text-neutral-6 text-center">등록된 영상이 없습니다.</p>
          ) : (
            <Select
              options={options}
              value={videoId}
              onChange={setVideoId}
              placeholder="영상을 선택하세요"
            />
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onBack}>
            뒤로가기
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={!videoId}
            onClick={() => onSelect(Number(videoId))}
          >
            다음
          </Button>
        </div>
      </div>
    </Modal>
  )
}
