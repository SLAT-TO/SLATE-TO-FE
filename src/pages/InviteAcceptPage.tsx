import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import Choice from '../components/Choice'
import { Button } from '../components/Button'
import inviteBg from '../assets/images/invite-bg.png'

const ROLE_OPTIONS = [
  { value: 'director', label: '감독' },
  { value: 'camera', label: '촬영' },
  { value: 'editor', label: '편집' },
  { value: 'etc', label: '기타' },
]

type Step = 'role' | 'name' | 'terms'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-1 flex min-h-[600px] w-full max-w-[1062px] flex-col gap-[60px] rounded-xl p-12 shadow-[0_3px_12px_rgba(169,204,244,0.15)]">
      {children}
    </div>
  )
}

// 워크스페이스 초대 수락 플로우. 역할 선택 -> 이름 설정 -> 약관 동의. 초대 수락 처리 로직은 이후 작업에서 연결.
export function InviteAcceptPage() {
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [allAgreed, setAllAgreed] = useState(false)

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(118deg, #9ff0ff 33.5%, #b9d6ff 98%)',
      }}
    >
      <img
        src={inviteBg}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />

      <p className="font-logo absolute top-8 left-8 text-lg tracking-tight text-white">
        SLATE - TO
      </p>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        {step === 'role' && (
          <Card>
            <p className="text-head-lg text-neutral-10 text-center font-bold">
              브랜드 광고 프로젝트에 초대되었어요!
            </p>
            <div className="flex flex-col gap-4">
              <p className="text-head-sm text-neutral-10 font-semibold">역할</p>
              <Select
                options={ROLE_OPTIONS}
                value={role}
                onChange={setRole}
                placeholder="역할을 선택해주세요."
              />
            </div>
            <Button type="button" fullWidth onClick={() => setStep('name')} className="mt-auto">
              입장하기
            </Button>
          </Card>
        )}

        {step === 'name' && (
          <Card>
            <div className="text-neutral-10 flex flex-col items-center gap-3 text-center">
              <p className="text-head-lg font-bold">브랜드 광고 프로젝트 영상1에 초대되었어요!</p>
              <p className="text-body-lg">이름을 설정해주세요</p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-head-sm text-neutral-10 font-semibold">이름</p>
              <Input
                id="invite-name"
                placeholder="댓글을 달 때 사용될 이름을 입력해주세요."
                value={name}
                onChange={setName}
              />
            </div>
            <Button type="button" fullWidth onClick={() => setStep('terms')} className="mt-auto">
              입장하기
            </Button>
          </Card>
        )}

        {step === 'terms' && (
          <Card>
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
            <Button type="submit" fullWidth className="mt-auto">
              동의합니다.
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
