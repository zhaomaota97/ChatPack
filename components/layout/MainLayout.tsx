'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useInitApp } from '@/hooks/useApp'
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
import { DebugPanel } from '@/components/common/DebugPanel'

export function MainLayout() {
  const { activePage, isAdminMode, activeAdminTab, isLoading, user } = useAppStore()
  
  // 初始化应用数据
  useInitApp()

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

  // 如果正在加载或没有用户信息，显示登录提示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">🎴 ChatPack</div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-3xl mb-6">🎴 ChatPack</div>
          <div className="text-gray-600 mb-6">单词十连抽 - 游戏化学习英语</div>
          <div className="text-sm text-gray-500">
            请先登录。如需帮助，请查看 DEPLOYMENT.md
          </div>
        </div>
      </div>
    )
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
      <DebugPanel />
    </>
  )
}
