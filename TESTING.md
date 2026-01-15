# ChatPack 测试指南

## ✅ 已修复的问题

### 1. TypeScript 错误
- ✅ 移除了 Supabase 的泛型类型参数，避免类型推断问题
- ✅ 修复了所有 API 路由的类型错误
- ✅ 所有组件现在都能正确编译

### 2. 数据加载问题
- ✅ 所有页面组件现在都使用真实 API 数据
- ✅ `useInitApp` hook 在应用启动时自动加载：
  - 用户信息
  - 用户卡包库存
  - 可用卡包列表
  - 聊天室列表
- ✅ `useUserWords` hook 自动加载用户单词库存

## 🚀 快速开始

### 1. 初始化数据库
在 Supabase SQL Editor 中运行：
```sql
-- 1. 先运行 supabase_init.sql（如果还没运行）
-- 2. 然后运行 seed_data.sql 添加测试数据
```

### 2. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3001

### 3. 注册/登录
1. 访问 `/login` 页面
2. 注册新账号（用户名：admin，密码：admin123）
3. 登录成功后自动跳转到主页

### 4. 赠送卡包（管理员操作）
由于你是新用户，需要管理员权限来赠送卡包：

**选项1：通过 Supabase SQL**
```sql
-- 获取用户ID
SELECT id, username FROM users WHERE username = 'admin';

-- 赠送卡包（替换 <user_id> 为实际ID）
INSERT INTO user_packs (user_id, pack_id, count) VALUES
('<user_id>', 'pack_normal', 3),
('<user_id>', 'pack_rare', 1)
ON CONFLICT (user_id, pack_id) 
DO UPDATE SET count = user_packs.count + EXCLUDED.count;
```

**选项2：设置为管理员后使用UI**
```sql
-- 将用户设置为管理员
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';
```
刷新页面，点击"管理后台"，在用户管理中赠送卡包。

## 📋 功能测试清单

### 用户功能
- [x] ✅ 注册/登录
- [x] ✅ 查看个人信息（ProfilePage）
- [x] ✅ 查看卡包列表（PackPage）
- [ ] ⏳ 开包获取单词（需要先有卡包）
- [x] ✅ 查看单词库存（InventoryPage）
- [x] ✅ 查看词汇库（VocabularyPage）
- [x] ✅ 生词本功能（NotebookPage）
- [x] ✅ 聊天室列表（ChatPage）
- [ ] ⏳ 发送消息（需要选择聊天室）
- [ ] ⏳ 实时消息更新（需要多个用户）

### 管理员功能
- [ ] ⏳ 用户管理
- [ ] ⏳ 单词管理
- [ ] ⏳ 单词书管理
- [ ] ⏳ 卡包管理
- [ ] ⏳ 聊天室管理

## 🔍 验证数据加载

### 检查网络请求
打开浏览器开发者工具 (F12) → Network 标签：

登录后应该看到以下API调用：
1. `GET /api/auth/me` - 获取用户信息 ✅
2. `GET /api/users/packs` - 获取用户卡包 ✅
3. `GET /api/packs` - 获取所有可用卡包 ✅
4. `GET /api/rooms` - 获取聊天室列表 ✅

切换到"我的单词"页面：
5. `GET /api/users/words` - 获取用户单词 ✅

### 检查状态
在浏览器控制台中运行：
```javascript
// 检查 Zustand store 状态
window.store = require('@/store/useAppStore').useAppStore.getState()
console.log('User:', window.store.user)
console.log('User Packs:', window.store.userPacks)
console.log('Available Packs:', window.store.availablePacks)
console.log('Rooms:', window.store.rooms)
console.log('User Words:', window.store.userWords)
```

## 🐛 常见问题

### 问题1：页面显示"加载中..."
**原因**：API 调用失败或超时
**解决**：
1. 检查 `.env.local` 文件中的 Supabase 配置
2. 检查浏览器控制台的错误信息
3. 检查网络标签中的 API 响应

### 问题2：卡包页面显示"正在加载卡包..."
**原因**：数据库中没有卡包数据
**解决**：运行 `seed_data.sql`

### 问题3：无法开包
**原因**：用户没有卡包
**解决**：
1. 通过 SQL 给用户赠送卡包（见上文）
2. 或设置为管理员后通过UI赠送

### 问题4：TypeScript 错误
**原因**：类型定义不匹配
**解决**：
1. 确保 `lib/supabase.ts` 没有使用泛型类型
2. 运行 `npm run build` 检查错误

## 📊 测试数据

### 测试单词
- apple (普通)
- book (普通)
- computer (稀有)
- elephant (稀有)
- fantastic (史诗)
- gorgeous (史诗)
- magnificent (传说)
- extraordinary (传说)

### 测试卡包
- 普通卡包：60%普通 + 30%稀有 + 8%史诗 + 2%传说
- 稀有卡包：100%稀有
- 史诗卡包：100%史诗
- 传说卡包：100%传说

### 测试聊天室
- 🌱 小学乐园
- 🌿 初中世界
- 🌳 高中殿堂
- 🎓 四级广场
- 🏆 六级天地
- 👑 考研领域

## 🎉 下一步

1. 添加更多测试单词（建议至少100个）
2. 测试开包功能
3. 测试聊天室实时消息
4. 测试管理员功能
5. 添加单词验证逻辑（聊天时检查是否拥有单词）

## 📝 API 端点列表

### 认证
- POST `/api/auth/register` - 注册
- POST `/api/auth/login` - 登录
- POST `/api/auth/logout` - 登出
- GET `/api/auth/me` - 获取当前用户

### 用户
- GET `/api/users/words` - 获取用户单词
- GET `/api/users/packs` - 获取用户卡包
- PATCH `/api/users/words/:id/favorite` - 收藏/取消收藏

### 卡包
- GET `/api/packs` - 获取所有卡包
- POST `/api/packs/open` - 开包

### 聊天室
- GET `/api/rooms` - 获取聊天室列表
- GET `/api/rooms/:id/messages` - 获取消息
- POST `/api/rooms/:id/messages` - 发送消息

### 消息
- POST `/api/messages/:id/rose` - 送花
- DELETE `/api/messages/:id/rose` - 取消送花

### 管理员（需要 ADMIN 权限）
- GET `/api/admin/users` - 用户列表
- POST `/api/admin/users/:id/packs` - 赠送卡包
- POST `/api/admin/users/:id/ban` - 封禁用户
- GET/POST/PATCH/DELETE `/api/admin/words` - 单词管理
- GET/POST/PATCH/DELETE `/api/admin/packs` - 卡包管理
- GET/POST/PATCH/DELETE `/api/admin/rooms` - 聊天室管理
