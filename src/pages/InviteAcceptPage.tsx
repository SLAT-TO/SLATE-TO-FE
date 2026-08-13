import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Select from '../components/Select'
import { Button } from '../components/Button'
import { getInvitation, acceptInvitation } from '../api/projects'
import { ApiError } from '../types/api'
import type { InvitationStatus } from '../types/project'
import { ROLE_OPTIONS } from '../constants/roles'
import { navigate } from '../utils/navigation'
import { invalidateProjectActivityData } from '../queries/projectInvalidation'
import inviteBg from '../assets/images/invite-bg.png'

/** 초대 링크는 1회용이라, 이미 수락된 뒤 같은 링크로 다시 들어오면 이 코드로 실패한다.
 * 그 경우 새로 가입시키는 대신 이미 속한 프로젝트로 그냥 들여보낸다. */
const ALREADY_JOINED_CODES = new Set(['PROJECT_INVITATION409', 'PROJECT_MEMBER409'])

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-neutral-1 flex min-h-[600px] w-full max-w-[1062px] flex-col gap-[60px] rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
      {children}
    </div>
  )
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return '요청 처리 중 오류가 발생했습니다.'
}

/** 프로젝트 초대 수락: 역할을 선택하면 바로 참여한다. */
export function InviteAcceptPage({ token }: { token: string }) {
  const queryClient = useQueryClient()
  const [role, setRole] = useState('')
  const [roleError, setRoleError] = useState<string | null>(null)

  const [projectId, setProjectId] = useState<number | null>(null)
  const [projectTitle, setProjectTitle] = useState<string | null>(null)
  const [invitationStatus, setInvitationStatus] = useState<InvitationStatus | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    getInvitation(token)
      .then((res) => {
        if (!cancelled) {
          setProjectId(res.projectId)
          setProjectTitle(res.projectTitle)
          setInvitationStatus(res.status)
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err))
      })

    return () => {
      cancelled = true
    }
  }, [token])

  // PENDING이 아니면(만료·이미 수락 등) 역할 선택 폼을 아예 보여주지 않는다 —
  // 예전엔 제출까지 시킨 뒤 acceptInvitation 실패로만 알 수 있었다
  const unusableMessage =
    invitationStatus == null || invitationStatus === 'PENDING'
      ? null
      : invitationStatus === 'EXPIRED'
        ? '만료된 초대 링크입니다.'
        : invitationStatus === 'ACCEPTED'
          ? '이미 수락된 초대 링크입니다.'
          : '유효하지 않은 초대 링크입니다.'

  const handleAccept = async () => {
    if (!role) {
      setRoleError('역할을 선택해주세요.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const accepted = await acceptInvitation(token, { roleNames: [role] })
      void invalidateProjectActivityData(queryClient, accepted.projectId)
      navigate('/workspace')
    } catch (err) {
      // 이미 이 프로젝트 멤버라 초대 수락만 실패한 것이면, 에러 대신 해당
      // 프로젝트로 들여보낸다 — 관리 페이지에서 내보내거나 스스로 나가지 않는 한
      // 같은 링크를 다시 타도 참여 상태가 유지되어야 한다.
      if (err instanceof ApiError && ALREADY_JOINED_CODES.has(err.code) && projectId != null) {
        navigate(`/workspace/projects/${projectId}`)
        return
      }
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
        {(loadError || unusableMessage) && (
          <Card>
            <p className="text-warning text-head-sm text-center font-semibold">
              {loadError ?? unusableMessage}
            </p>
            {unusableMessage && (
              <button
                type="button"
                onClick={() => navigate('/workspace')}
                className="text-body-sm text-primary mx-auto w-fit underline"
              >
                워크스페이스로 이동
              </button>
            )}
          </Card>
        )}

        {!loadError && !unusableMessage && (
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleAccept()
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
              {submitError && <p className="text-warning text-caption-lg">{submitError}</p>}
              <Button type="submit" fullWidth disabled={submitting} className="mt-auto">
                {submitting ? '입장 중...' : '입장하기'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
