import { useParams } from 'react-router-dom'
import ProjectDetailPage from '../../pages/ProjectDetailPage'

/** React Router params → ProjectDetailPage props */
export default function WorkspaceProjectRoute() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>()
  const projectId = Number(projectIdParam)

  if (!Number.isFinite(projectId)) {
    return <p className="text-body-sm text-warning">잘못된 프로젝트 경로입니다.</p>
  }

  return <ProjectDetailPage key={projectId} projectId={projectId} />
}
