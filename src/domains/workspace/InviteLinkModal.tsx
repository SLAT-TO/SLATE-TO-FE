import { useEffect, useState } from 'react'
import { createInvitation } from '../../api/projects'
import { Button } from '../../components/Button'
import Modal from '../../components/Modal'

interface InviteLinkModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

export default function InviteLinkModal({ isOpen, onClose, projectId }: InviteLinkModalProps) {
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setLoading(true)
    setError(null)
    setCopied(false)
    setInviteUrl('')

    void createInvitation(projectId)
      .then((result) => {
        if (!cancelled) setInviteUrl(result.inviteUrl)
      })
      .catch(() => {
        if (!cancelled) setError('초대 링크를 만들지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, projectId])

  const handleCopy = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[420px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-head-sm text-neutral-11 font-bold">팀원 초대하기</h2>
          <p className="text-body-sm text-neutral-6">
            링크를 공유하여 프로젝트에 팀원을 추가해보세요.
          </p>
        </div>

        {loading && <p className="text-caption-lg text-neutral-6">초대 링크를 만드는 중…</p>}
        {error && <p className="text-caption-lg text-warning">{error}</p>}

        {!loading && !error && (
          <div className="border-neutral-3 flex items-center gap-2 rounded-lg border px-3 py-2">
            <input
              readOnly
              value={inviteUrl}
              className="text-body-sm text-neutral-10 min-w-0 flex-1 bg-transparent outline-none"
              aria-label="초대 링크"
            />
            <Button variant="secondary" size="sm" className="w-auto shrink-0" onClick={handleCopy}>
              {copied ? '복사됨' : '링크 복사'}
            </Button>
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <Button variant="primary" className="flex-1" onClick={onClose}>
            확인
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}
