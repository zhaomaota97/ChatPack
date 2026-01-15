'use client'

import { useAppStore } from '@/store/useAppStore'
import { Sidebar } from './Sidebar'
import { AdminSidebar } from './AdminSidebar'
import { PackPage } from '@/components/pages/PackPage'
import { ChatPage } from '@/components/pages/ChatPage'
import { InventoryPage } from '@/components/pages/InventoryPage'
import { VocabularyPage } from '@/components/pages/VocabularyPage'
import { NotebookPage } from '@/components/pages/NotebookPage'
import { ProfilePage } from '@/components/pages/ProfilePage'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { AdminWords } from '@/components/admin/AdminWords'
import { AdminWordbooks } from '@/components/admin/AdminWordbooks'
import { AdminRooms } from '@/components/admin/AdminRooms'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { AdminPacks } from '@/components/admin/AdminPacks'
import { AdminSettings } from '@/components/admin/AdminSettings'
import { WordDetail } from '@/components/common/WordDetail'

export function MainLayout() {
  const { activePage, isAdminMode, activeAdminTab } = useAppStore()

  const renderUserPage = () => {
    switch (activePage) {
      case 'pack':
        return <PackPage />
      case 'chat':
        return <ChatPage />
      case 'inventory':
        return <InventoryPage />
      case 'vocabulary':
        return <VocabularyPage />
      case 'notebook':
        return <NotebookPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <PackPage />
    }
  }

  const renderAdminPage = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'words':
        return <AdminWords />
      case 'wordbooks':
        return <AdminWordbooks />
      case 'rooms':
        return <AdminRooms />
      case 'users':
        return <AdminUsers />
      case 'packs':
        return <AdminPacks />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <>
      <div className="flex gap-2.5 h-[98vh] p-2.5">
        {isAdminMode ? <AdminSidebar /> : <Sidebar />}
        <div className="flex-1 border border-gray-300 p-2.5 overflow-y-auto h-[98vh]">
          {isAdminMode ? renderAdminPage() : renderUserPage()}
        </div>
      </div>
      <WordDetail />
    </>
  )
}
