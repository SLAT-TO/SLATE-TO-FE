import { useState } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import { Button } from '../../components/Button'

interface WithdrawAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => void | Promise<void>
  error?: string
}

export default function WithdrawAccountModal({
  isOpen,
  onClose,
  onConfirm,
  error,
}: WithdrawAccountModalProps) {
  const [agreed, setAgreed] = useState(false)
  const [password, setPassword] = useState('')

  const handleConfirm = () => {
    if (!agreed || !password) return
    onConfirm(password)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[600px]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-head-md text-neutral-10 font-bold">회원 탈퇴</h2>
          <p className="text-body-sm text-neutral-5">
            회원 탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="border-neutral-5 text-caption-lg text-neutral-10 flex flex-col gap-2 rounded-lg border p-4">
            <p>워크스페이스와 구인구직에서의 모든 데이터가 삭제됩니다.</p>
            <p>탈퇴 후 동일한 이메일로 재가입이 제한될 수 있습니다.</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer sr-only"
            />
            <span className="bg-neutral-1 border-neutral-4 flex size-3 shrink-0 items-center justify-center rounded-sm border">
              {agreed && (
                <svg
                  viewBox="0 0 20 20"
                  className="text-primary size-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-body-sm text-neutral-10 font-semibold">
              위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다.
            </span>
          </label>
        </div>

        <Input
          label="비밀번호 입력"
          type="password"
          showPasswordToggle
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={setPassword}
          error={error}
        />

        <div className="flex justify-center gap-4">
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!agreed || !password}
            className="px-24"
          >
            확인
          </Button>
          <Button variant="secondary" onClick={onClose} className="px-24">
            취소
          </Button>
        </div>
      </div>
    </Modal>
  )
}
