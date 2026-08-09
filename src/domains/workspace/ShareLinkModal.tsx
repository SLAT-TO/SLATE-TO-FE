import { useEffect, useState } from 'react'
import { createShareLink, getShareLink } from '../../api/videos'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'
import { ApiError } from '../../types/api'

interface ShareLinkModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: number
}

function ShareLinkModalBody({ videoId, onClose }: { videoId: number; onClose: () => void }) {
  const [shareUrl, setShareUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadOrCreateLink() {
      try {
        let link
        try {
          link = await getShareLink(videoId)
        } catch (err) {
          if (
            !(err instanceof ApiError) ||
            (err.code !== 'COMMON404' && err.code !== 'SHARE_LINK404')
          ) {
            throw err
          }
          link = await createShareLink(videoId)
        }
        if (!cancelled) setShareUrl(`${window.location.origin}/share/${link.token}`)
      } catch {
        if (!cancelled) setError('게스트 초대 링크를 만들지 못했습니다.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadOrCreateLink()
    return () => {
      cancelled = true
    }
  }, [videoId])

  const handleCopy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-head-sm text-neutral-11 font-bold">게스트 초대하기</h2>
        <p className="text-body-sm text-neutral-6">
          링크를 공유하면 로그인 없이 이름을 등록하고 이 영상에 피드백을 남길 수 있어요.
        </p>
      </div>

      {loading && <p className="text-caption-lg text-neutral-6">초대 링크를 만드는 중…</p>}
      {error && <p className="text-caption-lg text-warning">{error}</p>}

      {!loading && !error && (
        <div className="border-neutral-3 flex items-center gap-2 rounded-lg border px-3 py-2">
          <input
            readOnly
            value={shareUrl}
            className="text-body-sm text-neutral-10 min-w-0 flex-1 bg-transparent outline-none"
            aria-label="게스트 초대 링크"
          />
          <Button variant="secondary" size="sm" className="w-auto shrink-0" onClick={handleCopy}>
            {copied ? '복사됨' : '링크 복사'}
          </Button>
        </div>
      )}

      <Button variant="primary" className="mt-2 w-full" onClick={onClose}>
        확인
      </Button>
    </div>
  )
}

export default function ShareLinkModal({ isOpen, onClose, videoId }: ShareLinkModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[420px]">
      {isOpen ? <ShareLinkModalBody videoId={videoId} onClose={onClose} /> : null}
    </Modal>
  )
}
