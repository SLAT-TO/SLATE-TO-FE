import { useEffect, useState } from 'react'
import { deleteProjectNotice, markNoticeRead, updateProjectNotice } from '../../api/projects'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import Input from '../../components/Input'
import TextArea from '../../components/TextArea'
import type { ProjectNoticeListItem } from '../../types/notice'
import { CARD_BASE } from '../../styles/card'

interface NoticeDetailViewProps {
  projectId: number
  notice: ProjectNoticeListItem
  meId: number | null
  onBack: () => void
  onUpdated: (notice: ProjectNoticeListItem) => void
  onDeleted: (noticeId: number) => void
}

function formatNoticeMeta(notice: ProjectNoticeListItem): string {
  const date = new Date(notice.createdAt)
  if (Number.isNaN(date.getTime())) return notice.writer.nickname
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${notice.writer.nickname} ${month}월 ${day}일 ${hours}:${minutes}`
}

export default function NoticeDetailView({
  projectId,
  notice,
  meId,
  onBack,
  onUpdated,
  onDeleted,
}: NoticeDetailViewProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(notice.title)
  const [content, setContent] = useState(notice.content)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isMine = meId !== null && notice.writer.id === meId

  useEffect(() => {
    if (notice.isRead) return
    let cancelled = false
    markNoticeRead(projectId, notice.id)
      .then(() => {
        if (!cancelled) onUpdated({ ...notice, isRead: true })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [projectId, notice, onUpdated])

  const startEdit = () => {
    setTitle(notice.title)
    setContent(notice.content)
    setEditing(true)
  }

  const submitEdit = async () => {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const updated = await updateProjectNotice(projectId, notice.id, {
        title: title.trim(),
        content: content.trim(),
      })
      onUpdated(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    await deleteProjectNotice(projectId, notice.id)
    onDeleted(notice.id)
  }

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-body-sm text-neutral-11 w-fit font-semibold"
      >
        {'< 공지사항 목록'}
      </button>

      <div className={`flex flex-col gap-3 ${CARD_BASE} p-5`}>
        {editing ? (
          <>
            <Input value={title} onChange={setTitle} placeholder="제목" />
            <TextArea value={content} onChange={setContent} placeholder="내용" rows={6} />
            <div className="flex gap-2">
              <Button variant="primary" disabled={saving} onClick={submitEdit}>
                {saving ? '저장 중…' : '저장'}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                취소
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2">
                <h2 className="text-body-sm text-neutral-11 font-bold">{notice.title}</h2>
                <span className="text-caption-lg text-neutral-6 shrink-0">
                  {formatNoticeMeta(notice)}
                </span>
              </div>
              {isMine && (
                <ActionMenu
                  items={[
                    { action: 'edit', onClick: startEdit },
                    { action: 'delete', onClick: () => setDeleteOpen(true) },
                  ]}
                />
              )}
            </div>
            <p className="text-body-sm text-neutral-10 whitespace-pre-wrap">{notice.content}</p>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="공지를 삭제할까요?"
        description="삭제한 공지는 복구할 수 없습니다."
      />
    </section>
  )
}
