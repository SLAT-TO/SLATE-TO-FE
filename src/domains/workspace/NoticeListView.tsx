import { useState } from 'react'
import { createProjectNotice } from '../../api/projects'
import { Button } from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import type { ProjectNoticeListItem } from '../../types/notice'

const CARD_SHADOW = 'shadow-[0px_3.4px_12.5px_rgba(169,204,244,0.15)]'

interface NoticeListViewProps {
  projectId: number
  notices: ProjectNoticeListItem[]
  onBack: () => void
  onOpenNotice: (noticeId: number) => void
  onCreated: (notice: ProjectNoticeListItem) => void
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

export default function NoticeListView({
  projectId,
  notices,
  onBack,
  onOpenNotice,
  onCreated,
}: NoticeListViewProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const openCreateModal = () => {
    setTitle('')
    setContent('')
    setCreateOpen(true)
  }

  const submitCreate = async () => {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    try {
      const created = await createProjectNotice(projectId, {
        title: title.trim(),
        content: content.trim(),
      })
      onCreated(created)
      setCreateOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-body-sm text-neutral-11 w-fit font-semibold"
      >
        {'< 대시보드'}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-head-sm text-neutral-11 font-bold">공지사항</h2>
        <Button variant="secondary" onClick={openCreateModal}>
          추가하기
        </Button>
      </div>

      {notices.length === 0 ? (
        <p className="text-caption-lg text-neutral-6">등록된 공지가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notices.map((notice) => (
            <li key={notice.id}>
              <button
                type="button"
                onClick={() => onOpenNotice(notice.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-[10px] bg-white px-4 py-4 text-left ${CARD_SHADOW}`}
              >
                <span className="text-body-sm text-neutral-11 min-w-0 truncate font-medium">
                  {notice.title}
                </span>
                <span className="text-caption-lg text-neutral-6 shrink-0">
                  {formatNoticeMeta(notice)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="bg-bg-primary flex w-[420px] flex-col gap-3 rounded-lg p-5">
          <h3 className="text-body-sm text-neutral-11 font-semibold">공지 작성</h3>
          <Input value={title} onChange={setTitle} placeholder="제목" />
          <TextArea value={content} onChange={setContent} placeholder="내용" rows={5} />
          <div className="mt-2 flex gap-2">
            <Button
              variant="primary"
              className="flex-1"
              disabled={!title.trim() || !content.trim() || submitting}
              onClick={submitCreate}
            >
              {submitting ? '등록 중…' : '등록'}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setCreateOpen(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
