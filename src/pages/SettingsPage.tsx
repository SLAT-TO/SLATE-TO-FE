import { useState } from 'react'
import { navigate } from '../utils/navigation'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import ConfirmModal from '../components/ConfirmModal'
import WithdrawAccountModal from '../domains/settings/WithdrawAccountModal'
import { logout } from '../api/auth'
import { deleteAccount } from '../api/users'
import { CARD_BASE } from '../styles/card'

const HEADER = <HeaderTitle>설정</HeaderTitle>

const ROW_CLASS =
  'w-fit text-left text-body-sm font-semibold text-neutral-11 transition-colors hover:text-primary'

const LINK_ROWS = [
  { label: '알림 설정', path: '/settings/notifications' },
  { label: '비밀번호 변경', path: '/settings/password' },
  { label: '문의 / 고객센터', path: '/settings/inquiry' },
] as const

function SettingsPage() {
  useHeaderSlot(HEADER)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')

  const handleLogout = async () => {
    // logout()은 요청 성공 여부와 무관하게 finally에서 로컬 토큰을 지우므로,
    // 요청 자체가 실패해도(예: 이미 만료된 세션) 로그인 화면으로는 이동시킨다.
    try {
      await logout()
    } catch {
      // 토큰은 이미 지워졌으므로 무시하고 진행
    }
    navigate('/login')
  }

  const handleWithdraw = async (password: string) => {
    try {
      await deleteAccount({ agreed: true, password })
      navigate('/login')
    } catch {
      setWithdrawError('비밀번호가 일치하지 않습니다.')
    }
  }

  return (
    <div className="p-6">
      <section className={`flex flex-col gap-8 p-10 ${CARD_BASE}`}>
        {LINK_ROWS.map((row) => (
          <button
            key={row.path}
            type="button"
            onClick={() => navigate(row.path)}
            className={ROW_CLASS}
          >
            {row.label}
          </button>
        ))}
        <button type="button" onClick={() => setLogoutOpen(true)} className={ROW_CLASS}>
          로그아웃
        </button>
        <button type="button" onClick={() => setWithdrawOpen(true)} className={ROW_CLASS}>
          회원탈퇴
        </button>
      </section>

      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        description="정말 로그아웃 하시겠습니까?"
      />

      <WithdrawAccountModal
        isOpen={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false)
          setWithdrawError('')
        }}
        onConfirm={handleWithdraw}
        error={withdrawError || undefined}
      />
    </div>
  )
}

export default SettingsPage
