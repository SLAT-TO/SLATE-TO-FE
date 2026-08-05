import ProjectSettingsView from '../domains/workspace/ProjectSettingsView'
import { navigate } from '../utils/navigation'

/** 워크스페이스 프로젝트 생성 — 설정(수정)과 동일한 전체 페이지 폼 */
export default function WorkspaceProjectCreatePage() {
  return (
    <ProjectSettingsView
      mode="create"
      onCancel={() => navigate('/workspace')}
      onCreated={(created) => navigate(`/workspace/projects/${created.id}`)}
    />
  )
}
