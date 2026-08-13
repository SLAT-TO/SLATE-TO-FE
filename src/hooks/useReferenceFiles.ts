import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [nextReferenceFileCursor, setNextReferenceFileCursor] = useState<number | null>(null)
  const [hasMoreReferenceFiles, setHasMoreReferenceFiles] = useState(false)
  const [isLoadingMoreReferenceFiles, setIsLoadingMoreReferenceFiles] = useState(false)
  const latestLoadIdRef = useRef(0)

  const load = useCallback(async (keyword?: string) => {
    const loadId = ++latestLoadIdRef.current
    const refFiles =
      guestShareToken != null
        ? await getGuestReferenceFiles(guestShareToken, { guestId, guestToken }, { keyword })
        : await getReferenceFiles(projectId, videoId, { keyword })
    if (loadId !== latestLoadIdRef.current) return []
    setReferenceFiles(refFiles.items)
    setNextReferenceFileCursor(refFiles.nextCursor)
    setHasMoreReferenceFiles(refFiles.hasNext)
    return refFiles.items
  }, [projectId, videoId, guestShareToken, guestId, guestToken])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(fileSearch.trim() || undefined)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [fileSearch, load])

  const loadMoreReferenceFiles = useCallback(async () => {
    if (!hasMoreReferenceFiles || nextReferenceFileCursor == null) return
    setIsLoadingMoreReferenceFiles(true)
    try {
      const page =
        guestShareToken != null
          ? await getGuestReferenceFiles(
              guestShareToken,
              { guestId, guestToken },
              { cursor: nextReferenceFileCursor, keyword: fileSearch.trim() || undefined },
            )
          : await getReferenceFiles(projectId, videoId, {
              cursor: nextReferenceFileCursor,
              keyword: fileSearch.trim() || undefined,
            })
      setReferenceFiles((prev) => [...prev, ...page.items])
      setNextReferenceFileCursor(page.nextCursor)
      setHasMoreReferenceFiles(page.hasNext)
    } finally {
      setIsLoadingMoreReferenceFiles(false)
    }
  }, [
    projectId,
    videoId,
    guestShareToken,
    guestId,
    guestToken,
    hasMoreReferenceFiles,
    nextReferenceFileCursor,
    fileSearch,
  ])

  const openPicker = useCallback(async () => {
    setPickerOpen(true)
    if (projectFiles.length === 0) {
      // BE 최대치(50)를 한 번에 받아 온다 — 이 피커는 "더 보기" UI가 없는 단발성 목록이라
      // 전체 커서 페이지네이션 대신 더 큰 페이지 하나로 실용적으로 커버한다.
      const page = await getProjectFiles(projectId, undefined, { size: 50 })
      setProjectFiles(page.items)
    }
  }, [projectId, projectFiles.length])

  const attachFile = useCallback(
    async (projectFileId: number) => {
      await linkReferenceFile(projectId, videoId, projectFileId)
      await load(fileSearch.trim() || undefined)
      setPickerOpen(false)
    },
    [projectId, videoId, load, fileSearch],
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

  return {
    referenceFiles,
    filteredFiles: referenceFiles,
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
    hasMoreReferenceFiles,
    isLoadingMoreReferenceFiles,
    loadMoreReferenceFiles,
  }
}
