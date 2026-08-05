import { Route } from 'react-router-dom'
import WorkspacePage from '../../pages/WorkspacePage'
import WorkspaceProjectRoute from './WorkspaceProjectRoute'

/** 워크스페이스 도메인 Route 조각 — App Routes 안에 끼워 넣는다 */
export function workspaceRoutes() {
  return (
    <>
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/workspace/projects/:projectId" element={<WorkspaceProjectRoute />} />
    </>
  )
}
