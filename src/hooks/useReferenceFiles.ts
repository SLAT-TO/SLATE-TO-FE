import { useCallback, useState } from 'react'
import { getProjectFiles, downloadProjectFile } from '../api/projects'
import { getReferenceFiles, linkReferenceFile, unlinkReferenceFile } from '../api/videos'
import { downloadBlob } from '../utils/downloadBlob'
import type { ReferenceFile } from '../types/video'
import type { ProjectFileListItem } from '../types/file'

/** 영상 상세의 참고 파일 목록 · 검색 · 첨부/제거/다운로드를 다루는 훅 */
export function useReferenceFiles(projectId: number, videoId: number) {
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([])
  const [fileSearch, setFileSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFileListItem[]>([])

  const load = useCallback(async () => {
    const refFiles = await getReferenceFiles(videoId)
    setReferenceFiles(refFiles.items)
    return refFiles.items
  }, [videoId])

  const openPicker = useCallback(async () => {
    setPickerOpen(true)
    if (projectFiles.length === 0) {
      const page = await getProjectFiles(projectId)
      setProjectFiles(page.items)
    }
  }, [projectId, projectFiles.length])

  const attachFile = useCallback(
    async (projectFileId: number) => {
      const linked = await linkReferenceFile(videoId, projectFileId)
      setReferenceFiles((prev) => [...prev, linked])
      setPickerOpen(false)
    },
    [videoId],
  )

  const removeReferenceFile = useCallback(
    async (referenceFileId: number) => {
      await unlinkReferenceFile(videoId, referenceFileId)
      setReferenceFiles((prev) => prev.filter((f) => f.referenceFileId !== referenceFileId))
    },
    [videoId],
  )

  const downloadReferenceFile = useCallback(
    async (projectFileId: number, fileName: string) => {
      const blob = await downloadProjectFile(projectId, projectFileId)
      downloadBlob(blob, fileName)
    },
    [projectId],
  )

  const filteredFiles = referenceFiles.filter((f) =>
    f.fileName.toLowerCase().includes(fileSearch.toLowerCase()),
  )

  return {
    referenceFiles,
    filteredFiles,
    fileSearch,
    setFileSearch,
    pickerOpen,
    setPickerOpen,
    projectFiles,
    load,
    openPicker,
    attachFile,
    removeReferenceFile,
    downloadReferenceFile,
  }
}
