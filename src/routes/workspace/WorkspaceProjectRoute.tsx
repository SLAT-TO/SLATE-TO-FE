import { useParams } from 'react-router-dom'
import ProjectDetailPage from '../../pages/ProjectDetailPage'

/** React Router params → ProjectDetailPage props */
export default function WorkspaceProjectRoute() {
  const { projectId: projectIdParam, videoId: videoIdParam } = useParams<{
    projectId: string
    videoId?: string
  }>()
  const projectId = Number(projectIdParam)
  const videoId = videoIdParam != null ? Number(videoIdParam) : null

  if (!Number.isFinite(projectId)) {
    return <p className="text-body-sm text-warning">잘못된 프로젝트 경로입니다.</p>
  }

  if (videoIdParam != null && !Number.isFinite(videoId)) {
    return <p className="text-body-sm text-warning">잘못된 영상 경로입니다.</p>
  }

  return (
    <ProjectDetailPage
      key={projectId}
      projectId={projectId}
      videoId={Number.isFinite(videoId) ? videoId : null}
    />
  )
}
