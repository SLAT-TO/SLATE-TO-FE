import { useEffect, useState } from 'react'
import { Switch } from '../components/Switch'
import { Button } from '../components/Button'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { getNotificationSettings, updateNotificationSettings } from '../api/users'
import type { NotificationSettings } from '../types/user'
import { navigate } from '../utils/navigation'
import { CARD_BASE } from '../styles/card'

const HEADER = <HeaderTitle>알림 설정</HeaderTitle>

type ToggleKey =
  'emailDeadlineReminder' | 'emailAssigned' | 'emailNewApplicant' | 'emailMissedSummary'

const TOGGLE_ROWS: Array<{ key: ToggleKey; title: string; description: string }> = [
  {
    key: 'emailDeadlineReminder',
    title: '마감 임박 알림',
    description: '일정, 나의 공고, 북마크 공고 마감 임박시 알림을 제공합니다.',
  },
  {
    key: 'emailAssigned',
    title: '담당자 지정',
    description: '새로운 일정, 피드백 답글 추가시 알림을 제공합니다.',
  },
  {
    key: 'emailNewApplicant',
    title: '구인구직 지원 알림',
    description: '내가 올린 공고에 지원자가 생겼을 때 알림을 제공합니다.',
  },
  {
    key: 'emailMissedSummary',
    title: '놓친 소식 요약',
    description: '24시간 미 접속시 오늘의 브리프 내용을 알림으로 제공합니다.',
  },
]

function SettingsNotificationsPage() {
  useHeaderSlot(HEADER)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getNotificationSettings()
      .then((result) => {
        if (!cancelled) setSettings(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = (key: ToggleKey) => (checked: boolean) => {
    setSettings((prev) => (prev ? { ...prev, [key]: checked } : prev))
  }

  const handleSubmit = async () => {
    if (!settings) return
    const updated = await updateNotificationSettings(settings)
    setSettings(updated)
    navigate('/settings')
  }

  const handleCancel = () => {
    navigate('/settings')
  }

  if (loading || !settings) {
    return (
      <div className="p-6">
        <p className="text-body-sm text-neutral-6">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <p className="text-body-lg text-neutral-10">
        중요한 소식을 놓치지 않도록 이메일 알림을 설정할 수 있어요.
      </p>

      <section className={`flex flex-col gap-6 p-8 ${CARD_BASE}`}>
        <h2 className="text-body-sm text-neutral-11 border-neutral-5 border-b pb-2 font-semibold">
          이메일 전체 알림
        </h2>
        {TOGGLE_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-body-sm text-neutral-11 font-semibold">{row.title}</p>
              <p className="text-caption-lg text-neutral-10">{row.description}</p>
            </div>
            <Switch
              checked={settings[row.key]}
              onChange={handleToggle(row.key)}
              ariaLabel={row.title}
            />
          </div>
        ))}
      </section>

      <section className={`flex flex-col gap-1 p-6 ${CARD_BASE}`}>
        <p className="text-body-sm text-neutral-10">
          서비스 내 알림은 이용에 필요한 알림으로 기본 제공돼요.
        </p>
        <p className="text-body-sm text-neutral-10">이메일 알림만 설정할 수 있어요.</p>
      </section>

      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={handleSubmit} className="px-24">
          등록
        </Button>
        <Button variant="secondary" onClick={handleCancel} className="px-24">
          취소
        </Button>
      </div>
    </div>
  )
}

export default SettingsNotificationsPage
