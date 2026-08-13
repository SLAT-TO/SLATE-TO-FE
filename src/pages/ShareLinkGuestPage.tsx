import { useEffect, useState, type FormEvent } from 'react'
import { accessShareLink, registerGuest } from '../api/videos'
import { VideoDetailView } from '../domains/workspace/VideoDetailView'
import MainLayout from '../layouts/MainLayout'
import Input from '../components/Input'
import { Button } from '../components/Button'
import { ApiError } from '../types/api'
import type { ShareLinkAccess } from '../types/feedback'
import { getGuestSession, setGuestSession } from '../utils/guestSession'

type ShareLinkGuestPageProps = {
  token: string
}

type GuestShareStep = 'invitation' | 'registration' | 'feedback'

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

/** 공유 링크의 초대 안내와 게스트 등록을 거쳐, 팀원과 동일한 영상 상세(VideoDetailView)를
 * 게스트 모드로 보여준다 — 화면이 따로 놀지 않도록 부품을 새로 짜지 않고 그대로 재사용한다. */
export function ShareLinkGuestPage({ token }: ShareLinkGuestPageProps) {
  const [access, setAccess] = useState<ShareLinkAccess | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [guestSession, setGuestSessionState] = useState(() => getGuestSession(token))
  const [step, setStep] = useState<GuestShareStep>(() => (guestSession ? 'feedback' : 'invitation'))
  const [name, setName] = useState('')
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

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    setRegistering(true)
    setRegisterError(null)
    try {
      const result = await registerGuest(token, { name: name.trim() })
      const session = { guestId: result.guestId, sessionToken: result.sessionToken }
      setGuestSession(token, session)
      setGuestSessionState(session)
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
              이름을 등록한 뒤 영상 피드백에 참여할 수 있습니다.
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

  // step === 'feedback' — guestSession은 이 시점엔 항상 있다 (없으면 'invitation'에서 시작함)
  if (!guestSession) return null

  return (
    <MainLayout>
      <VideoDetailView
        videoId={access.videoId}
        guest={{
          shareToken: token,
          guestId: guestSession.guestId,
          guestToken: guestSession.sessionToken,
          initialTitle: access.videoTitle,
        }}
        onBack={() => {}}
      />
    </MainLayout>
  )
}
