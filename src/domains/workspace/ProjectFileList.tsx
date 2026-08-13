import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  deleteFile,
  downloadProjectFile,
  getProjectFiles,
  pinProjectFile,
  unpinProjectFile,
} from '../../api/projects'
import ActionMenu from '../../components/ActionMenu'
import { Button } from '../../components/Button'
import ConfirmModal from '../../components/ConfirmModal'
import InlineIcon from '../../components/InlineIcon'
import type { ProjectFileListItem } from '../../types/file'
import { downloadBlob } from '../../utils/downloadBlob'
import documentIcon from '../../assets/icons/document.svg?raw'
import downloadIcon from '../../assets/icons/download.svg?raw'
import searchIcon from '../../assets/icons/search.svg?raw'
import starIcon from '../../assets/icons/star.svg?raw'
import { CARD_BASE } from '../../styles/card'
import { invalidateProjectActivityData } from '../../queries/projectInvalidation'
import ProjectFileDetailView from './ProjectFileDetailView'
import ProjectFileUploadModal from './ProjectFileUploadModal'

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
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<ProjectFileListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectFileListItem | null>(null)
  const [selectedFile, setSelectedFile] = useState<ProjectFileListItem | null>(null)
  const latestLoadIdRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchKeyword(keyword), 400)
    return () => window.clearTimeout(timer)
  }, [keyword])

  const reloadFiles = useCallback(async () => {
    const loadId = ++latestLoadIdRef.current
    setLoading(true)
    try {
      const page = await getProjectFiles(projectId, searchKeyword.trim() || undefined)
      if (loadId === latestLoadIdRef.current) {
        setFiles(page.items)
      }
    } finally {
      if (loadId === latestLoadIdRef.current) {
        setLoading(false)
      }
    }
  }, [projectId, searchKeyword])

  useEffect(() => {
    void Promise.resolve().then(reloadFiles)
  }, [reloadFiles])

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <Button
          variant="secondary"
          onClick={() => setUploadOpen(true)}
          className="w-full sm:w-auto"
        >
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
            className={`flex flex-col gap-3 ${CARD_BASE} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
          >
            <button
              type="button"
              onClick={() => setSelectedFile(file)}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <InlineIcon svg={documentIcon} className="text-neutral-5 size-6 shrink-0" />
              <span className="text-body-sm text-neutral-11 min-w-0 truncate">{file.fileName}</span>
            </button>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:shrink-0">
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

      <ProjectFileUploadModal
        projectId={projectId}
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => {
          await reloadFiles()
          void invalidateProjectActivityData(queryClient, projectId)
        }}
      />

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
