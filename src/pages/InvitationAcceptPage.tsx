import { useEffect, useState } from 'react'
import { acceptInvitation, getInvitation } from '../api/projects'
import { Button } from '../components/Button'
import { ApiError } from '../types/api'
import type { ProjectInvitation } from '../types/project'
import { navigate } from '../utils/navigation'

type InvitationAcceptPageProps = {
  token: string
}

type ViewState =
  | { phase: 'loading' }
  | { phase: 'invalid'; message: string }
  | { phase: 'ready'; invitation: ProjectInvitation }
  | { phase: 'accepting'; invitation: ProjectInvitation }
  | { phase: 'accepted'; projectId: number }
  | { phase: 'error'; invitation: ProjectInvitation; message: string }

function formatExpiresAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}까지`
}

export default function InvitationAcceptPage({ token }: InvitationAcceptPageProps) {
  const [state, setState] = useState<ViewState>({ phase: 'loading' })

  useEffect(() => {
    let cancelled = false
    getInvitation(token)
      .then((invitation) => {
        if (cancelled) return
        if (invitation.status === 'EXPIRED') {
          setState({ phase: 'invalid', message: '만료된 초대 링크입니다.' })
        } else if (invitation.status === 'ACCEPTED') {
          setState({ phase: 'invalid', message: '이미 처리된 초대 링크입니다.' })
        } else {
          setState({ phase: 'ready', invitation })
        }
      })
      .catch((err) => {
        if (cancelled) return
        setState({
          phase: 'invalid',
          message: err instanceof ApiError ? err.message : '유효하지 않은 초대 링크입니다.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const accept = async () => {
    if (state.phase !== 'ready') return
    const { invitation } = state
    setState({ phase: 'accepting', invitation })
    try {
      const result = await acceptInvitation(token, { roleNames: ['EDITOR'] })
      setState({ phase: 'accepted', projectId: result.projectId })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PROJECT409') {
        setState({ phase: 'accepted', projectId: invitation.projectId })
        return
      }
      setState({
        phase: 'error',
        invitation,
        message:
          err instanceof ApiError && err.code === 'COMMON401'
            ? '로그인이 필요합니다. 로그인 후 이 링크를 다시 열어주세요.'
            : err instanceof ApiError
              ? err.message
              : '초대 수락에 실패했습니다.',
      })
    }
  }

  if (state.phase === 'loading') {
    return <p className="text-body-sm text-neutral-6">불러오는 중…</p>
  }

  if (state.phase === 'invalid') {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-body-sm text-neutral-6">{state.message}</p>
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="text-body-sm text-primary w-fit underline"
        >
          워크스페이스로 돌아가기
        </button>
      </section>
    )
  }

  if (state.phase === 'accepted') {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-head-sm text-neutral-11 font-bold">프로젝트에 참여했습니다</h1>
        <Button
          variant="primary"
          onClick={() => navigate(`/workspace/projects/${state.projectId}`)}
        >
          프로젝트로 이동
        </Button>
      </section>
    )
  }

  const { invitation } = state
  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-20 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-caption-lg text-neutral-6">{invitation.inviterName} 님이 초대했어요</p>
        <h1 className="text-head-md text-neutral-11 font-bold">{invitation.projectTitle}</h1>
        <p className="text-caption-sm text-neutral-5">{formatExpiresAt(invitation.expiresAt)}</p>
      </div>

      {state.phase === 'error' && <p className="text-caption-lg text-warning">{state.message}</p>}

      <Button
        variant="primary"
        onClick={accept}
        disabled={state.phase === 'accepting'}
        className="w-full"
      >
        {state.phase === 'accepting' ? '참여하는 중…' : '초대 수락하기'}
      </Button>
    </section>
  )
}
