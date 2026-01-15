'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.username || !formData.password) {
      setError('用户名和密码不能为空')
      return
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      if (isRegister) {
        await authApi.register({
          username: formData.username,
          password: formData.password
        })
        alert('注册成功！请登录')
        setIsRegister(false)
        setFormData({ ...formData, password: '', confirmPassword: '' })
      } else {
        await authApi.login({
          username: formData.username,
          password: formData.password
        })
        router.push('/')
      }
    } catch (err: any) {
      setError(err?.error?.message || (isRegister ? '注册失败' : '登录失败'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? '注册账号' : '登录'} - ChatPack
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              disabled={loading}
            />
          </div>
          
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">确认密码</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={loading}
              />
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
              setFormData({ username: '', password: '', confirmPassword: '' })
            }}
            className="text-blue-600 hover:underline text-sm"
            disabled={loading}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
    </div>
  )
}
