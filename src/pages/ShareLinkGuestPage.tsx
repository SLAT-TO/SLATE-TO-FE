import { useEffect, useState, type FormEvent } from 'react'
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

type GuestShareStep = 'invitation' | 'registration' | 'feedback'

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

/** 공유 링크의 초대 안내와 게스트 등록을 거쳐 피드백 화면으로 진입한다. */
export function ShareLinkGuestPage({ token }: ShareLinkGuestPageProps) {
  const [access, setAccess] = useState<ShareLinkAccess | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [step, setStep] = useState<GuestShareStep>('invitation')
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
        if (!cancelled) {
          setLoadError(errorMessage(err, '공유 링크를 확인할 수 없습니다.'))
        }
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
    isSubmittingFeedback,
    pendingFeedbackActionId,
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
    editingReplyId,
    editingReplyContent,
    setEditingReplyContent,
    isSubmittingReply,
    pendingReplyActionId,
    toggleReplies,
    submitReply,
    startEditReply,
    cancelEditReply,
    saveEditReply,
    removeReply,
  } = useFeedbackReplies(guestId ?? undefined)

  useEffect(() => {
    if (!access || guestId === null) return
    void loadFeedbacks()
  }, [access, guestId, loadFeedbacks])

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    setRegistering(true)
    setRegisterError(null)
    try {
      const result = await registerGuest(token, { name: name.trim() })
      setGuestId(result.guestId)
      setStep('feedback')
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
        <p className="text-body-sm text-neutral-6">불러오는 중...</p>
      </div>
    )
  }

  if (step === 'invitation') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <section className="bg-neutral-1 flex w-full max-w-[480px] flex-col gap-8 rounded-xl p-8 text-center shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
          <div className="flex flex-col gap-3">
            <p className="text-head-sm text-neutral-11 font-bold">영상 피드백에 초대되었어요</p>
            <p className="text-body-lg text-neutral-10 font-semibold">{access.videoTitle}</p>
            <p className="text-body-sm text-neutral-6">
              이름과 역할을 등록한 뒤 영상 피드백에 참여할 수 있습니다.
            </p>
          </div>
          <Button type="button" fullWidth onClick={() => setStep('registration')}>
            확인
          </Button>
        </section>
      </div>
    )
  }

  if (step === 'registration') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleRegister}
          className="bg-neutral-1 flex w-full max-w-[400px] flex-col gap-6 rounded-xl p-8 shadow-[0_3px_12px_rgba(169,204,244,0.15)]"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-head-sm text-neutral-11 font-bold">{access.videoTitle}</p>
            <p className="text-body-sm text-neutral-6">참여 정보를 입력해 주세요.</p>
          </div>
          <Input id="guest-name" placeholder="이름을 입력하세요." value={name} onChange={setName} />
          {registerError && <p className="text-warning text-caption-lg">{registerError}</p>}
          <Button type="submit" fullWidth disabled={registering || !name.trim()}>
            {registering ? '등록 중...' : '입장하기'}
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
          isSubmittingFeedback={isSubmittingFeedback}
          pendingFeedbackActionId={pendingFeedbackActionId}
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
          editingReplyId={editingReplyId}
          editingReplyContent={editingReplyContent}
          setEditingReplyContent={setEditingReplyContent}
          isSubmittingReply={isSubmittingReply}
          pendingReplyActionId={pendingReplyActionId}
          toggleReplies={toggleReplies}
          submitReply={submitReply}
          startEditReply={startEditReply}
          cancelEditReply={cancelEditReply}
          saveEditReply={saveEditReply}
          removeReply={removeReply}
          meId={null}
          guestId={guestId ?? undefined}
          onSeek={() => {}}
        />
      </div>
    </div>
  )
}
