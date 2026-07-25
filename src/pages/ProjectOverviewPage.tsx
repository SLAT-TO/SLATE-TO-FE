import type { ReactNode } from 'react'
import Tag from '../components/Tag'
import type { Portfolio } from '../types/portfolio'

// GET /api/v1/portfolios/:id 응답으로 교체. 지금은 목 데이터.
const MOCK_PORTFOLIO: Portfolio = {
  id: 1,
  title: '연애혁명',
  type: '영화 / 드라마',
  kind: 'EXTERNAL',
  clientName: '스튜디오 X',
  roles: ['DIRECTOR', 'EDITOR'],
  description: '고등학생들의 연애와 우정을 그린 웹드라마 연출 및 편집을 담당했습니다.',
  comment: '감정선과 몰입감을 살리는 연출을 중점으로 작업했습니다.',
  youtubeUrl: 'https://www.youtube.com/watch?v=hDBSEV7ZwZs',
  thumbnailUrl: 'https://placehold.co/300x160',
}

const ROLE_LABEL_MAP: Record<string, string> = {
  DIRECTOR: '연출',
  EDITOR: '편집',
  CINEMATOGRAPHER: '촬영',
  SOUND: '사운드',
  PD: 'PD',
  ART: '미술',
}

// 개요 항목 하나 (라벨 + 값)
function OverviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-neutral-11 text-sm font-semibold">{label}</h4>
      <div className="text-neutral-7 text-sm">{children}</div>
    </div>
  )
}

function ProjectOverviewPage() {
  const portfolio = MOCK_PORTFOLIO
  const { type, kind, clientName, roles, description, comment, youtubeUrl } = portfolio

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 정보 카드 */}
      <section className="rounded-xl bg-white p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3">
          {/* 윗줄: 맡은 역할 / 코멘트 / 프로젝트 설명 */}
          <OverviewField label="맡은 역할">
            <div className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <Tag key={role}>{ROLE_LABEL_MAP[role] ?? role}</Tag>
              ))}
            </div>
          </OverviewField>

          <OverviewField label="코멘트">{comment ?? '-'}</OverviewField>

          <OverviewField label="프로젝트 설명">{description}</OverviewField>

          {/* 아랫줄: 프로젝트 유형 / 클라이언트 */}
          <OverviewField label="프로젝트 유형">{type}</OverviewField>

          <OverviewField label="클라이언트">
            {kind === 'EXTERNAL' ? (clientName ?? '-') : '개인 프로젝트'}
          </OverviewField>
        </div>
      </section>

      {/* 영상 링크 카드: 있으면 링크, 없으면 업로드 박스 */}
      <section className="rounded-xl bg-white p-6 shadow-xs">
        {youtubeUrl ? (
          <OverviewField label="영상링크">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary break-all underline"
            >
              {youtubeUrl}
            </a>
          </OverviewField>
        ) : (
          <label className="bg-neutral-2 hover:bg-neutral-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg py-12 shadow-xs">
            <input
              type="file"
              accept=".png,.pdf,.doc,.docx,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // 파일 업로드 API 연동 필요
                  console.log('선택된 파일:', file.name)
                }
              }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-5">
              <path
                d="M12 16V4M12 4L7 9M12 4l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-neutral-6 text-sm">이 곳에 파일을 추가해주세요.</p>
            <p className="text-neutral-5 text-xs">파일을 드래그하거나 클릭하여 업로드</p>
            <p className="text-neutral-5 text-xs">
              첨부가능 파일 형식 (Png, Pdf, Word, Jpg) 최대 5GB
            </p>
          </label>
        )}
      </section>
    </div>
  )
}

export default ProjectOverviewPage
