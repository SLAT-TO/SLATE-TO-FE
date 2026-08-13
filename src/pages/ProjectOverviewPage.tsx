import { useEffect, useState, type ReactNode } from 'react'
import Tag from '../components/Tag'
import type { Portfolio } from '../types/portfolio'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import { getMyPortfolio, getUserPortfolio } from '../api/users'
import { roleLabel } from '../constants/roles'
import { videoCategoryLabel } from '../constants/videoCategories'

interface ProjectOverviewPageProps {
  portfolioId: number
  /** 있으면 타인 포트폴리오 조회, 없으면 내 것 */
  userId?: number
}

function ProjectOverviewPage({ portfolioId, userId }: ProjectOverviewPageProps) {
  useHeaderSlot(HEADER)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = userId
          ? await getUserPortfolio(userId, portfolioId)
          : await getMyPortfolio(portfolioId)
        if (!cancelled) setPortfolio(result)
      } catch {
        if (!cancelled) setError('프로젝트 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [portfolioId, userId])

  if (isLoading) {
    return <p className="text-caption-sm text-neutral-6 p-6">불러오는 중…</p>
  }

  if (error || !portfolio) {
    return <p className="text-caption-sm text-neutral-6 p-6">{error}</p>
  }

  const { type, kind, clientName, roles, description, comment, youtubeUrl } = portfolio

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 정보 카드 */}
      <section className="rounded-xl bg-white p-6 shadow-xs">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 왼쪽 2열 — 설명이 길어져도 밀리지 않도록 분리 */}
          <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
            <OverviewField label="맡은 역할">
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role) => (
                  <Tag key={role}>{roleLabel(role)}</Tag>
                ))}
              </div>
            </OverviewField>

            <OverviewField label="코멘트">{comment ?? '-'}</OverviewField>

            <OverviewField label="프로젝트 유형">{videoCategoryLabel(type)}</OverviewField>

            <OverviewField label="클라이언트">
              {kind === 'EXTERNAL' ? (clientName ?? '-') : '개인 프로젝트'}
            </OverviewField>
          </div>

          <OverviewField label="프로젝트 설명">{description}</OverviewField>
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
        ) : userId ? (
          <OverviewField label="영상링크">-</OverviewField>
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

function OverviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-neutral-11 text-sm font-semibold">{label}</h4>
      <div className="text-neutral-7 text-sm">{children}</div>
    </div>
  )
}

const HEADER = <HeaderTitle>프로젝트 개요</HeaderTitle>

export default ProjectOverviewPage
