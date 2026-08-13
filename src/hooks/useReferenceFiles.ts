import { useCallback, useState } from 'react'
import { getProjectFiles, downloadProjectFile } from '../api/projects'
import {
  downloadGuestReferenceFile,
  getGuestReferenceFiles,
  getReferenceFiles,
  linkReferenceFile,
  unlinkReferenceFile,
} from '../api/videos'
import { downloadBlob } from '../utils/downloadBlob'
import type { ReferenceFile } from '../types/video'
import type { ProjectFileListItem } from '../types/file'

/** 영상 상세의 참고 파일 목록 · 검색 · 첨부/제거/다운로드를 다루는 훅
 * @param guestShareToken 공유링크로 들어온 게스트인 경우 — 조회·다운로드만 게스트 전용 엔드포인트로 분기
 * (다른 훅들과 마찬가지로 객체가 아닌 개별 값으로 받는다 — 호출부에서 매 렌더 새로
 * 만들어지는 객체를 넘기면 useCallback 의존성이 매번 바뀌어 load 이펙트가 계속 재실행된다) */
export function useReferenceFiles(
  projectId: number,
  videoId: number,
  guestShareToken?: string,
  guestId?: number,
  guestToken?: string,
) {
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([])
  const [fileSearch, setFileSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFileListItem[]>([])

  const load = useCallback(async () => {
    const refFiles =
      guestShareToken != null
        ? await getGuestReferenceFiles(guestShareToken, { guestId, guestToken })
        : await getReferenceFiles(projectId, videoId)
    setReferenceFiles(refFiles.items)
    return refFiles.items
  }, [projectId, videoId, guestShareToken, guestId, guestToken])

  const openPicker = useCallback(async () => {
    setPickerOpen(true)
    if (projectFiles.length === 0) {
      const page = await getProjectFiles(projectId)
      setProjectFiles(page.items)
    }
  }, [projectId, projectFiles.length])

  const attachFile = useCallback(
    async (projectFileId: number) => {
      await linkReferenceFile(projectId, videoId, projectFileId)
      await load()
      setPickerOpen(false)
    },
    [projectId, videoId, load],
  )

  const removeReferenceFile = useCallback(
    async (referenceFileId: number) => {
      await unlinkReferenceFile(projectId, videoId, referenceFileId)
      setReferenceFiles((prev) => prev.filter((f) => f.referenceFileId !== referenceFileId))
    },
    [projectId, videoId],
  )

  const downloadReferenceFile = useCallback(
    async (referenceFileId: number, fileName: string) => {
      if (guestShareToken != null) {
        const blob = await downloadGuestReferenceFile(guestShareToken, referenceFileId, {
          guestId,
          guestToken,
        })
        downloadBlob(blob, fileName)
        return
      }
      const file = referenceFiles.find((f) => f.referenceFileId === referenceFileId)
      if (file?.projectFileId == null) return
      const blob = await downloadProjectFile(projectId, file.projectFileId)
      downloadBlob(blob, fileName)
    },
    [guestShareToken, guestId, guestToken, projectId, referenceFiles],
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
