import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Select from '../components/Select'
import Choice from '../components/Choice'
import { Button } from '../components/Button'
import { getInvitation, acceptInvitation } from '../api/projects'
import { ApiError } from '../types/api'
import { ROLE_OPTIONS } from '../constants/roles'
import { navigate } from '../utils/navigation'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'
import inviteBg from '../assets/images/invite-bg.png'

type Step = 'role' | 'terms'

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-neutral-1 flex min-h-[600px] w-full max-w-[1062px] flex-col gap-[60px] rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
      {children}
    </div>
  )
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'PROJECT_MEMBER409') return '이미 참여 중인 프로젝트입니다.'
    return err.message
  }
  return '요청 처리 중 오류가 발생했습니다.'
}

/** 프로젝트 초대 수락: 역할 선택 후 약관에 동의한다. */
export function InviteAcceptPage({ token }: { token: string }) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState('')
  const [roleError, setRoleError] = useState<string | null>(null)
  const [allAgreed, setAllAgreed] = useState(false)

  const [projectTitle, setProjectTitle] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getInvitation(token)
      .then((res) => {
        if (!cancelled) setProjectTitle(res.projectTitle)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err))
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleAccept = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const accepted = await acceptInvitation(token, { roleNames: role ? [role] : [] })
      void invalidateProjectActivityData(queryClient, accepted.projectId)
      navigate('/workspace')
    } catch (err) {
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const inviteTitle = projectTitle
    ? `${projectTitle}에 초대되었어요!`
    : '초대 정보를 불러오는 중...'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[linear-gradient(118deg,#9ff0ff_33.5%,#b9d6ff_98%)]">
      <img
        src={inviteBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {loadError && (
          <Card>
            <p className="text-warning text-head-sm text-center font-semibold">{loadError}</p>
          </Card>
        )}

        {!loadError && step === 'role' && (
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!role) {
                  setRoleError('역할을 선택해주세요.')
                  return
                }
                setStep('terms')
              }}
              className="flex flex-1 flex-col gap-[60px]"
            >
              <p className="text-head-lg text-neutral-10 text-center font-bold">{inviteTitle}</p>
              <div className="flex flex-col gap-4">
                <p className="text-head-sm text-neutral-10 font-semibold">
                  역할<span className="text-warning ml-0.5">*</span>
                </p>
                <Select
                  options={ROLE_OPTIONS}
                  value={role}
                  onChange={(next) => {
                    setRole(next)
                    setRoleError(null)
                  }}
                  placeholder="역할을 선택해주세요."
                  required
                  error={roleError ?? undefined}
                />
              </div>
              <Button type="submit" fullWidth className="mt-auto">
                입장하기
              </Button>
            </form>
          </Card>
        )}

        {!loadError && step === 'terms' && (
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleAccept()
              }}
              className="flex flex-1 flex-col gap-[60px]"
            >
              <div className="flex flex-col items-center gap-3">
                <p className="text-head-lg text-neutral-10 font-bold">이용 약관 동의</p>
                <Choice
                  type="checkbox"
                  checked={allAgreed}
                  onChange={setAllAgreed}
                  label="모두 동의합니다."
                />
              </div>
              <div className="flex flex-col gap-4">
                <Choice
                  type="checkbox"
                  checked={allAgreed}
                  onChange={setAllAgreed}
                  label="이용약관 (필수)"
                />
                <div className="bg-neutral-2 border-neutral-3 text-neutral-5 text-body-sm h-60 overflow-y-auto rounded-lg border p-4">
                  이용약관 내용이 여기에 표시됩니다.
                </div>
              </div>
              {submitError && <p className="text-warning text-caption-lg">{submitError}</p>}
              <Button type="submit" fullWidth disabled={submitting} className="mt-auto">
                동의합니다.
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
