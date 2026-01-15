#!/usr/bin/env node

/**
 * ChatPack API 测试脚本
 * 用于测试各个API接口是否正常工作
 */

const API_BASE = 'http://localhost:3000/api'

// 测试用户数据
// const testUser = {
//   username: `testuser_${Date.now()}`,
//   password: 'test123456',
// }

testUser = {
  username: 'admin',
  password: 'admin123',
}



let authCookie = ''

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authCookie) {
    headers['Cookie'] = authCookie
  }

  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // 保存Cookie
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      authCookie = setCookie.split(';')[0]
    }

    const data = await response.json()
    
    if (data.success) {
      console.log('✅ 成功:', JSON.stringify(data.data, null, 2))
    } else {
      console.log('❌ 失败:', data.error)
    }

    return data
  } catch (error) {
    console.log('❌ 错误:', error.message)
    return null
  }
}

async function runTests() {
  console.log('🚀 开始测试 ChatPack API...\n')
  console.log('=' . repeat(60))

  // 1. 测试注册
  console.log('\n📝 测试 1: 用户注册')
  await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser),
  })

  // 2. 测试登录
  console.log('\n📝 测试 2: 用户登录')
  await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(testUser),
  })

  // 3. 测试获取当前用户信息
  console.log('\n📝 测试 3: 获取当前用户信息')
  await apiRequest('/auth/me')

  // 4. 测试获取卡包列表
  console.log('\n📝 测试 4: 获取卡包列表')
  const packsResult = await apiRequest('/packs')
  
  const firstPack = packsResult?.data?.[0]

  // 5. 测试用户卡包库存
  console.log('\n📝 测试 5: 获取用户卡包库存')
  await apiRequest('/users/packs')

  // 6. 测试聊天室列表
  console.log('\n📝 测试 6: 获取聊天室列表')
  const roomsResult = await apiRequest('/rooms')
  
  const firstRoom = roomsResult?.data?.[0]

  // 7. 测试获取聊天室消息
  if (firstRoom) {
    console.log('\n📝 测试 7: 获取聊天室消息')
    await apiRequest(`/rooms/${firstRoom.id}/messages`)
  }

  // 8. 测试单词书列表
  console.log('\n📝 测试 8: 获取单词书列表')
  await apiRequest('/wordbooks')

  // 9. 测试用户单词库存
  console.log('\n📝 测试 9: 获取用户单词库存')
  await apiRequest('/users/words')

  // 10. 测试登出
  console.log('\n📝 测试 10: 用户登出')
  await apiRequest('/auth/logout', { method: 'POST' })

  console.log('\n' + '='.repeat(60))
  console.log('\n✨ 测试完成!\n')
  console.log('💡 提示:')
  console.log('- 如果所有测试都显示 ✅，说明API工作正常')
  console.log('- 如果有 ❌，请检查错误信息并查看服务器日志')
  console.log('- 要测试开包功能，需要先通过管理员给用户赠送卡包\n')
}

// 运行测试
runTests().catch(console.error)
