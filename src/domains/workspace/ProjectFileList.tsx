import { useEffect, useState } from 'react'
import {
  deleteFile,
  getDownloadUrl,
  getProjectFiles,
  getUploadUrl,
  registerFile,
} from '../../api/projects'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import FileInput from '../../components/FileInput'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import type { ProjectFileListItem } from '../../types/file'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import searchIcon from '../../assets/icons/search.svg?raw'
import { CARD_BASE } from '../../styles/card'

interface ProjectFileListProps {
  projectId: number
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getFullYear()}년 ${month}월 ${day}일 ${hours}:${minutes}`
}

export default function ProjectFileList({ projectId }: ProjectFileListProps) {
  const [files, setFiles] = useState<ProjectFileListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectFileListItem | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchKeyword(keyword), 400)
    return () => window.clearTimeout(timer)
  }, [keyword])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const page = await getProjectFiles(projectId, searchKeyword.trim() || undefined)
        if (!cancelled) setFiles(page.items)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [projectId, searchKeyword])

  const openUploadModal = () => {
    setUploadFile(null)
    setDescription('')
    setUploadOpen(true)
  }

  const submitUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    try {
      const { uploadUrl, storageKey } = await getUploadUrl(projectId, {
        fileName: uploadFile.name,
        contentType: uploadFile.type || 'application/octet-stream',
        fileSize: uploadFile.size,
      })
      await fetch(uploadUrl, { method: 'PUT', body: uploadFile }).catch(() => null)
      await registerFile(projectId, {
        fileName: uploadFile.name,
        description: description.trim() || undefined,
        storageKey,
        contentType: uploadFile.type || 'application/octet-stream',
        fileSize: uploadFile.size,
      })
      const page = await getProjectFiles(projectId, keyword.trim() || undefined)
      setFiles(page.items)
      setUploadOpen(false)
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (fileId: number) => {
    const { downloadUrl } = await getDownloadUrl(projectId, fileId)
    window.open(downloadUrl, '_blank', 'noopener')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteFile(projectId, deleteTarget.id)
    setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-head-sm text-neutral-11 font-bold">파일</h2>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="bg-neutral-1 text-body-sm text-neutral-10 placeholder:text-neutral-5 border-neutral-3 focus:border-primary h-12 w-full rounded-lg border pr-4 pl-4 outline-none"
          />
          <InlineIcon
            svg={searchIcon}
            className="text-neutral-6 pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2"
          />
        </div>
        <Button variant="secondary" onClick={openUploadModal}>
          추가하기
        </Button>
      </div>

      <div className="bg-neutral-1 flex min-h-[280px] flex-col gap-2 rounded-[10px] p-4">
        {!loading && files.length === 0 && (
          <p className="text-caption-lg text-neutral-6 flex flex-1 flex-col items-center justify-center text-center">
            {keyword.trim()
              ? '검색 결과가 없어요.'
              : '등록된 파일이 없어요.\n첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB'}
          </p>
        )}
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center justify-between gap-3 ${CARD_BASE} px-4 py-3`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
              <span className="text-body-sm text-neutral-11 min-w-0 truncate">{file.fileName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="text-caption-lg text-neutral-6">
                {formatDateTime(file.createdAt)}
              </span>
              <span className="text-caption-lg text-neutral-6">{file.uploader.nickname}</span>
              <button
                type="button"
                onClick={() => downloadFile(file.id)}
                aria-label="다운로드"
                className="text-neutral-9 hover:text-primary"
              >
                <InlineIcon svg={downloadIcon} className="size-4" />
              </button>
              <ActionMenu items={[{ action: 'delete', onClick: () => setDeleteTarget(file) }]} />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)}>
        <div className="bg-bg-primary flex w-[420px] flex-col gap-3 rounded-lg p-5">
          <h3 className="text-body-sm text-neutral-11 font-semibold">파일 추가</h3>
          <FileInput
            value={uploadFile ? [uploadFile] : []}
            onChange={(files) => setUploadFile(files[0] ?? null)}
            hint="첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB"
          />
          <TextArea
            value={description}
            onChange={setDescription}
            placeholder="파일 설명 (선택)"
            rows={3}
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="primary"
              className="flex-1"
              disabled={!uploadFile || uploading}
              onClick={submitUpload}
            >
              {uploading ? '업로드 중…' : '업로드'}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setUploadOpen(false)}>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="파일을 삭제할까요?"
        description="삭제한 파일은 복구할 수 없습니다."
      />
    </section>
  )
}
