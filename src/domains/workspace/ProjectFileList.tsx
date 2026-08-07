import { useEffect, useState } from 'react'
import {
  deleteFile,
  downloadProjectFile,
  getProjectFiles,
  pinProjectFile,
  unpinProjectFile,
  uploadProjectFile,
} from '../../api/projects'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import FileInput from '../../components/FileInput'
import InlineIcon from '../../components/InlineIcon'
import Modal from '../../components/Modal'
import TextArea from '../../components/TextArea'
import type { ProjectFileListItem } from '../../types/file'
import { downloadBlob } from '../../utils/downloadBlob'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import searchIcon from '../../assets/icons/search.svg?raw'
import starIcon from '../../assets/icons/star.svg?raw'
import { CARD_BASE } from '../../styles/card'
import ProjectFileDetailView from './ProjectFileDetailView'

interface ProjectFileListProps {
  projectId: number
  initialFileId?: number | null
  onInitialFileConsumed?: () => void
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

/** 핀한 파일을 목록 상단으로 (BE 목록 정렬과 동일하게 즉시 반영) */
function sortFilesByPin(files: ProjectFileListItem[]): ProjectFileListItem[] {
  return [...files].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
    return b.id - a.id
  })
}

export default function ProjectFileList({
  projectId,
  initialFileId = null,
  onInitialFileConsumed,
}: ProjectFileListProps) {
  const [files, setFiles] = useState<ProjectFileListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const [uploadPinned, setUploadPinned] = useState(false)
  const [description, setDescription] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectFileListItem | null>(null)
  const [selectedFile, setSelectedFile] = useState<ProjectFileListItem | null>(null)

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
    setUploadFileName('')
    setUploadPinned(false)
    setDescription('')
    setUploadError('')
    setUploadOpen(true)
  }

  const submitUpload = async () => {
    if (!uploadFile || !uploadFileName.trim()) {
      setUploadError('파일명과 업로드할 파일을 모두 입력해주세요.')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const uploaded = await uploadProjectFile(projectId, uploadFile, {
        fileName: uploadFileName.trim(),
        description: description.trim() || undefined,
      })
      if (uploadPinned) {
        try {
          await pinProjectFile(projectId, uploaded.id)
        } catch {
          window.alert('파일은 업로드됐지만 즐겨찾기를 적용하지 못했습니다.')
        }
      }
      const page = await getProjectFiles(projectId, keyword.trim() || undefined)
      setFiles(page.items)
      setUploadOpen(false)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (fileId: number, fileName: string) => {
    const blob = await downloadProjectFile(projectId, fileId)
    downloadBlob(blob, fileName)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteFile(projectId, deleteTarget.id)
    setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id))
    if (selectedFile?.id === deleteTarget.id) setSelectedFile(null)
    if (initialFileId === deleteTarget.id) onInitialFileConsumed?.()
    setDeleteTarget(null)
  }

  const toggleFilePin = async (file: ProjectFileListItem) => {
    const next = !file.isPinned
    setFiles((prev) =>
      sortFilesByPin(prev.map((f) => (f.id === file.id ? { ...f, isPinned: next } : f))),
    )
    try {
      if (next) await pinProjectFile(projectId, file.id)
      else await unpinProjectFile(projectId, file.id)
    } catch {
      setFiles((prev) =>
        sortFilesByPin(prev.map((f) => (f.id === file.id ? { ...f, isPinned: !next } : f))),
      )
    }
  }

  const activeFile =
    selectedFile ?? files.find((file) => initialFileId != null && file.id === initialFileId) ?? null

  if (activeFile) {
    return (
      <>
        <ProjectFileDetailView
          file={activeFile}
          onBack={() => {
            setSelectedFile(null)
            onInitialFileConsumed?.()
          }}
          onDownload={() => void downloadFile(activeFile.id, activeFile.fileName)}
          onDelete={() =>
            setDeleteTarget({
              id: activeFile.id,
              fileName: activeFile.fileName,
              description: activeFile.description,
              contentType: activeFile.contentType,
              fileSize: activeFile.fileSize,
              isPinned: activeFile.isPinned,
              isFinal: activeFile.isFinal,
              uploader: activeFile.uploader,
              createdAt: activeFile.createdAt,
            })
          }
        />
        <ConfirmModal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="파일을 삭제할까요?"
          description="삭제한 파일은 복구할 수 없습니다."
        />
      </>
    )
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
            className={`focus-within:ring-primary relative flex items-center justify-between gap-3 focus-within:ring-2 ${CARD_BASE} px-4 py-3`}
          >
            <button
              type="button"
              onClick={() => setSelectedFile(file)}
              aria-label={`${file.fileName} 상세 보기`}
              className="absolute inset-0 z-0 rounded-[inherit]"
            />
            <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3">
              <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
              <span className="text-body-sm text-neutral-11 min-w-0 truncate">{file.fileName}</span>
            </div>
            <div className="pointer-events-auto relative z-10 flex shrink-0 items-center gap-4">
              <span className="text-caption-lg text-neutral-6">
                {formatDateTime(file.createdAt)}
              </span>
              <span className="text-caption-lg text-neutral-6">{file.uploader.nickname}</span>
              <button
                type="button"
                onClick={() => toggleFilePin(file)}
                aria-label={file.isPinned ? '즐겨찾기 해제' : '즐겨찾기'}
                className={file.isPinned ? 'text-caution' : 'text-neutral-4 hover:text-neutral-6'}
              >
                <InlineIcon svg={starIcon} className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => downloadFile(file.id, file.fileName)}
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
        <div className="bg-bg-primary flex w-[700px] max-w-[calc(100vw-32px)] flex-col gap-5 rounded-lg p-7">
          <h3 className="text-head-sm text-neutral-11 font-bold">파일 추가</h3>
          <label className="flex flex-col gap-2">
            <span className="text-body-sm text-neutral-11 font-semibold">파일명</span>
            <span className="relative">
              <input
                value={uploadFileName}
                onChange={(event) => {
                  setUploadFileName(event.target.value)
                  setUploadError('')
                }}
                placeholder="파일명을 입력해주세요."
                className="bg-neutral-2 text-body-sm text-neutral-11 placeholder:text-neutral-5 border-neutral-3 h-12 w-full rounded-lg border px-4 pr-12 outline-none"
              />
              <button
                type="button"
                onClick={() => setUploadPinned((value) => !value)}
                aria-label={uploadPinned ? '즐겨찾기 해제' : '즐겨찾기'}
                className={`absolute top-1/2 right-3 -translate-y-1/2 ${
                  uploadPinned ? 'text-caution' : 'text-neutral-5'
                }`}
              >
                <InlineIcon svg={starIcon} className="size-5" />
              </button>
            </span>
          </label>
          <TextArea
            value={description}
            onChange={(value) => {
              setDescription(value)
              setUploadError('')
            }}
            placeholder="파일 설명 (선택)"
            rows={3}
          />
          <FileInput
            value={uploadFile ? [uploadFile] : []}
            onChange={(files) => {
              const file = files[0] ?? null
              setUploadFile(file)
              if (file && !uploadFileName.trim()) setUploadFileName(file.name)
              setUploadError('')
            }}
            accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
            hint="첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB"
            error={uploadError || undefined}
          />
          <div className="mt-1 flex justify-center gap-3">
            <Button variant="primary" className="w-40" disabled={uploading} onClick={submitUpload}>
              {uploading ? '업로드 중…' : '업로드'}
            </Button>
            <Button variant="secondary" className="w-40" onClick={() => setUploadOpen(false)}>
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
