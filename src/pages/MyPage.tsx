import { useEffect, useState } from 'react'
import ProfileOverviewCard from '../domains/mypage/ProfileOverviewCard'
import ProjectHistoryCard from '../domains/mypage/ProjectHistoryCard'
import type { ProfileSummary, StatItem, ProjectHistoryItem } from '../types/MyPage.types'
import { navigate } from '../utils/navigation'
import { useHeaderSlot } from '../hooks/useHeaderSlot'
import HeaderTitle from '../components/HeaderTitle'
import ConfirmModal from '../components/ConfirmModal'
import { deletePortfolio, getMe, getMyActivityStats, getUserPortfolios } from '../api/users'
import {
  toProfileSummary,
  toProjectTypeStats,
  toRoleStats,
  toProjectHistoryItem,
} from '../domains/mypage/myPageAdapter'

const HEADER = <HeaderTitle>마이페이지</HeaderTitle>

function MyPage() {
  useHeaderSlot(HEADER)

  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const [projectTypeStats, setProjectTypeStats] = useState<StatItem[]>([])
  const [roleStats, setRoleStats] = useState<StatItem[]>([])
  const [projects, setProjects] = useState<ProjectHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const me = await getMe()
        // 포트폴리오는 내 userId가 있어야 조회 가능해 프로필 이후에 요청
        const [stats, portfolios] = await Promise.all([
          getMyActivityStats(),
          getUserPortfolios(me.id),
        ])
        if (cancelled) return
        setProfile(toProfileSummary(me))
        setProjectTypeStats(toProjectTypeStats(stats))
        setRoleStats(toRoleStats(stats))
        setProjects(portfolios.items.map(toProjectHistoryItem))
      } catch {
        if (!cancelled) setError('마이페이지 정보를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleEditClick = () => {
    navigate('/mypage/edit')
  }

  const handleProjectClick = (id: string) => {
    navigate(`/mypage/project/${id}`)
  }

  const handleProjectDelete = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleAddProject = () => {
    navigate('/mypage/project/new')
  }

  const handleProjectEdit = (id: string) => {
    navigate(`/mypage/project/${id}/edit`)
  }

  const handleDeleteConfirm = async () => {
    if (deleteTargetId == null) return
    const portfolioId = Number(deleteTargetId)
    if (!Number.isFinite(portfolioId)) return

    try {
      await deletePortfolio(portfolioId)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTargetId))
    } catch {
      setError('삭제에 실패했습니다.')
    } finally {
      setDeleteTargetId(null)
    }
  }

  if (isLoading) {
    return <p className="text-caption-sm text-neutral-6 p-6">불러오는 중…</p>
  }

  if (error || !profile) {
    return <p className="text-caption-sm text-neutral-6 p-6">{error}</p>
  }

  const isEmpty = projects.length === 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:flex-1">
          <ProfileOverviewCard
            profile={profile}
            projectTypeStats={projectTypeStats}
            roleStats={roleStats}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-neutral-11 text-base font-semibold">프로젝트 이력</h3>
          {!isEmpty && (
            <button
              type="button"
              onClick={handleAddProject}
              className="border-primary text-primary hover:bg-main-1 rounded-md border px-3 py-1.5 text-sm"
            >
              + 추가하기
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white py-14 shadow-xs">
            <p className="text-neutral-7 text-sm">
              프로젝트 이력이 없어요. 프로젝트를 추가해보세요.
            </p>
            <button
              type="button"
              onClick={handleAddProject}
              className="border-primary text-primary hover:bg-main-1 rounded-md border px-8 py-2 text-sm font-medium"
            >
              프로젝트 추가
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectHistoryCard
                key={project.id}
                project={project}
                onEdit={handleProjectEdit}
                onDelete={handleProjectDelete}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </section>
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => void handleDeleteConfirm()}
        title="정말 삭제하시겠습니까?"
        description="삭제된 프로젝트 이력은 되돌릴 수 없어요."
      />
    </div>
  )
}

export default MyPage
