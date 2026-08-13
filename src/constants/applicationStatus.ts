import type { ApplicationStatusValue } from '../types/recruitment'

type ApplicationStatusPresentation = {
  label: string
  tagVariant: 'secondary' | 'ghost'
}

const APPLICATION_STATUS_PRESENTATION = {
  PENDING: { label: '지원 완료', tagVariant: 'secondary' },
  ACCEPTED: { label: '수락됨', tagVariant: 'secondary' },
  REJECTED: { label: '거절됨', tagVariant: 'ghost' },
} satisfies Record<ApplicationStatusValue, ApplicationStatusPresentation>

export function applicationStatusPresentation(status: ApplicationStatusValue) {
  return APPLICATION_STATUS_PRESENTATION[status]
}
