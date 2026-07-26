import { useState } from 'react'
import Input from '../components/Input'
import { Button } from '../components/Button'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { changePassword } from '../api/users'
import { navigate } from '../utils/navigation'
import { CARD_BASE } from '../styles/card'

const HEADER = <HeaderTitle>비밀번호 변경</HeaderTitle>

function SettingsPasswordPage() {
  useHeaderSlot(HEADER)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await changePassword({ currentPassword, newPassword })
      navigate('/settings')
    } catch {
      setError('현재 비밀번호가 일치하지 않습니다.')
    }
  }

  const handleCancel = () => {
    navigate('/settings')
  }

  return (
    <div className="p-6">
      <section className={`flex flex-col gap-7 p-10 ${CARD_BASE}`}>
        <Input
          label="현재 비밀번호"
          type="password"
          showPasswordToggle
          placeholder="현재 비밀번호를 입력해주세요."
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <Input
          label="새 비밀번호"
          type="password"
          showPasswordToggle
          placeholder="새 비밀번호를 입력해주세요."
          value={newPassword}
          onChange={setNewPassword}
        />
        <Input
          label="비밀번호 확인"
          type="password"
          showPasswordToggle
          placeholder="새 비밀번호를 다시 입력해주세요."
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={error || undefined}
        />
        <div className="flex justify-center gap-4 pt-2">
          <Button variant="primary" onClick={handleSubmit} className="px-24">
            추가
          </Button>
          <Button variant="secondary" onClick={handleCancel} className="px-24">
            취소
          </Button>
        </div>
      </section>
    </div>
  )
}

export default SettingsPasswordPage
