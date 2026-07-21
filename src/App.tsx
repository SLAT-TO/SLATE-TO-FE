import MainLayout from './layouts/MainLayout'
import ProjectCard from './domains/project/ProjectCard'

function App() {
  return (
    <MainLayout userName="김수민">
      <div style={{ maxWidth: 1070, padding: 24 }}>
        <ProjectCard
          title="위로, 또 위로"
          statusLabel="진행중"
          statusVariant="secondary"
          tags={['다큐', '단편']}
          progress={64}
          members={[{ alt: '김수민' }, { alt: '이하늘' }]}
        />
      </div>
    </MainLayout>
  )
}

export default App
