import { useEffect, useState } from 'react'
import { accessShareLink, registerGuest } from '../api/videos'
import { useFeedbacks } from '../hooks/useFeedbacks'
import { useFeedbackReplies } from '../hooks/useFeedbackReplies'
import FeedbackPanel from '../domains/workspace/FeedbackPanel'
import Input from '../components/Input'
import { Button } from '../components/Button'
import { ApiError } from '../types/api'
import type { ShareLinkAccess } from '../types/feedback'

type ShareLinkGuestPageProps = {
  token: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

/** 공유링크로 들어온 비로그인 게스트가 닉네임 등록 후 피드백을 보고 남기는 화면.
 * 공유링크 진입 응답엔 영상 재생 정보(youtubeUrl)가 없어 플레이어 없이 피드백 패널만 노출한다.
 * BE가 아직 게스트 인증(guestId로 피드백 API 호출)을 지원하지 않아, 등록 이후 피드백
 * 조회/작성은 BE 보완 전까지 401이 날 수 있다 — 코드는 실 API 기준으로 맞춰둔 상태. */
export function ShareLinkGuestPage({ token }: ShareLinkGuestPageProps) {
  const [access, setAccess] = useState<ShareLinkAccess | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [guestId, setGuestId] = useState<number | null>(null)
  const [registering, setRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    accessShareLink(token)
      .then((result) => {
        if (!cancelled) setAccess(result)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, '공유 링크를 확인할 수 없습니다.'))
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const videoId = access?.videoId ?? 0

  const {
    filteredFeedbacks,
    filter,
    setFilter,
    newFeedback,
    setNewFeedback,
    pendingStart,
    pendingEnd,
    isCapturingRange,
    editingFeedbackId,
    editingFeedbackContent,
    setEditingFeedbackContent,
    load: loadFeedbacks,
    clearPendingTime,
    attachCurrentTime,
    toggleRangeCapture,
    submitFeedback,
    toggleResolved,
    removeFeedback,
    startEditFeedback,
    cancelEditFeedback,
    saveEditFeedback,
  } = useFeedbacks(videoId, () => 0, guestId ?? undefined)

  const {
    expandedFeedbackId,
    repliesByFeedback,
    newReply,
    setNewReply,
    toggleReplies,
    submitReply,
  } = useFeedbackReplies(guestId ?? undefined)

  useEffect(() => {
    if (guestId === null || !access) return
    void loadFeedbacks()
  }, [guestId, access, loadFeedbacks])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setRegistering(true)
    setRegisterError(null)
    try {
      const result = await registerGuest(token, { name: name.trim() })
      setGuestId(result.guestId)
    } catch (err) {
      setRegisterError(errorMessage(err, '게스트 등록에 실패했습니다.'))
    } finally {
      setRegistering(false)
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-warning text-body-sm">{loadError}</p>
      </div>
    )
  }

  if (!access) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-body-sm text-neutral-6">불러오는 중…</p>
      </div>
    )
  }

  if (guestId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleRegister}
          className="bg-neutral-1 flex w-full max-w-[400px] flex-col gap-6 rounded-xl p-8 shadow-[0_3px_12px_rgba(169,204,244,0.15)]"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-head-sm text-neutral-11 font-bold">{access.videoTitle}</p>
            <p className="text-body-sm text-neutral-6">피드백을 남기려면 이름을 입력해주세요</p>
          </div>
          <Input id="guest-name" placeholder="이름을 입력하세요" value={name} onChange={setName} />
          {registerError && <p className="text-warning text-caption-lg">{registerError}</p>}
          <Button type="submit" fullWidth disabled={registering}>
            {registering ? '등록 중…' : '입장하기'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 px-4 py-8">
      <h1 className="text-head-sm text-neutral-11 text-center font-bold">{access.videoTitle}</h1>
      <div className="mx-auto w-full max-w-[500px]">
        <FeedbackPanel
          filteredFeedbacks={filteredFeedbacks}
          filter={filter}
          setFilter={setFilter}
          newFeedback={newFeedback}
          setNewFeedback={setNewFeedback}
          pendingStart={pendingStart}
          pendingEnd={pendingEnd}
          isCapturingRange={isCapturingRange}
          editingFeedbackId={editingFeedbackId}
          editingFeedbackContent={editingFeedbackContent}
          setEditingFeedbackContent={setEditingFeedbackContent}
          clearPendingTime={clearPendingTime}
          attachCurrentTime={attachCurrentTime}
          toggleRangeCapture={toggleRangeCapture}
          submitFeedback={submitFeedback}
          toggleResolved={toggleResolved}
          removeFeedback={removeFeedback}
          startEditFeedback={startEditFeedback}
          cancelEditFeedback={cancelEditFeedback}
          saveEditFeedback={saveEditFeedback}
          expandedFeedbackId={expandedFeedbackId}
          repliesByFeedback={repliesByFeedback}
          newReply={newReply}
          setNewReply={setNewReply}
          toggleReplies={toggleReplies}
          submitReply={submitReply}
          meId={null}
          onSeek={() => {}}
        />
      </div>
    </div>
  )
}
