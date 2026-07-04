import type { ReactNode } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

type MainLayoutProps = {
  children: ReactNode
  userName?: string
}

export default function MainLayout({ children, userName }: MainLayoutProps) {
  return (
    <div className="bg-bg-secondary flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={userName} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  )
}
