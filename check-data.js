#!/usr/bin/env node

/**
 * 快速诊断脚本 - 检查API返回的数据
 */

const API_BASE = 'http://localhost:3001/api'

async function checkAPI(endpoint, description) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`)
    const data = await response.json()
    
    console.log(`\n${description}`)
    console.log('=' . repeat(50))
    
    if (data.success) {
      console.log('✅ 成功')
      console.log('数据:', JSON.stringify(data.data, null, 2))
      
      if (Array.isArray(data.data)) {
        console.log(`📊 数量: ${data.data.length}`)
      }
    } else {
      console.log('❌ 失败:', data.error)
    }
  } catch (error) {
    console.log('❌ 错误:', error.message)
  }
}

async function main() {
  console.log('🔍 ChatPack 数据诊断\n')
  
  await checkAPI('/packs', '📦 检查卡包数据')
  await checkAPI('/rooms', '💬 检查聊天室数据')
  
  console.log('\n\n💡 如果看到空数组，请在 Supabase 中运行 seed_data.sql')
  console.log('💡 如果看到错误，请检查 .env.local 配置\n')
}

main().catch(console.error)
