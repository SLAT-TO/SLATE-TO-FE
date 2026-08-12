import type { ReactNode } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { HeaderSlotProvider } from './HeaderSlotProvider'
import { CONTENT_PX } from '../constants/layout'

type MainLayoutProps = {
  children: ReactNode
  userName?: string
  profileImageUrl?: string | null
}

export default function MainLayout({ children, userName, profileImageUrl }: MainLayoutProps) {
  return (
    <HeaderSlotProvider>
      <div className="bg-bg-secondary flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header userName={userName} profileImageUrl={profileImageUrl} />
          <main className={`flex-1 overflow-auto pt-6 pb-20 ${CONTENT_PX}`}>{children}</main>
        </div>
      </div>
    </HeaderSlotProvider>
  )
}
