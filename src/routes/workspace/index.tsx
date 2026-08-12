import { createElement, lazy } from 'react'
import { Route } from 'react-router-dom'

const workspacePage = lazy(() => import('../../pages/WorkspacePage'))
const workspaceProjectCreatePage = lazy(() => import('../../pages/WorkspaceProjectCreatePage'))
const workspaceProjectRoute = lazy(() => import('./WorkspaceProjectRoute'))

/** 워크스페이스 도메인 Route 조각 — App Routes 안에 끼워 넣는다 */
export function workspaceRoutes() {
  return (
    <>
      <Route path="/workspace" element={createElement(workspacePage)} />
      <Route path="/workspace/projects/new" element={createElement(workspaceProjectCreatePage)} />
      <Route
        path="/workspace/projects/:projectId/videos/:videoId"
        element={createElement(workspaceProjectRoute)}
      />
      <Route path="/workspace/projects/:projectId" element={createElement(workspaceProjectRoute)} />
    </>
  )
}
