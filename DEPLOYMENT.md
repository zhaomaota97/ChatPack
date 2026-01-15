# ChatPack 项目部署指南

## 已完成的工作

✅ 数据库设计和初始化SQL脚本
✅ 完整的API接口实现（RESTful + Realtime）
✅ 认证系统（注册、登录、JWT）
✅ 单词和卡包管理
✅ 聊天室和消息系统
✅ 管理员后台API
✅ Supabase Realtime集成

## 部署步骤

### 1. 初始化Supabase数据库

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧的 **SQL Editor**
4. 点击 **New query**
5. 复制 `supabase_init.sql` 文件的全部内容
6. 粘贴到编辑器中
7. 点击 **Run** 按钮执行

执行成功后，数据库将包含：
- 所有表结构（users, words, packs, chat_rooms, messages等）
- 枚举类型
- 数据库函数（开包抽取、邀请码生成等）
- 触发器（自动更新时间戳、邀请码）
- 初始数据（单词书、聊天室、示例单词、卡包）

### 2. 配置Realtime

在Supabase Dashboard中：

1. 点击左侧的 **Database** -> **Replication**
2. 找到 `messages` 表
3. 启用 **Realtime** 开关
4. （可选）为了优化性能，只监听需要的事件：INSERT 和 UPDATE

### 3. 安装依赖并运行

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

### 4. 创建管理员账号

数据库初始化后没有管理员账号。你需要：

方法1：通过API注册后手动修改
```bash
# 1. 先注册一个普通账号
# 2. 然后在Supabase Dashboard的SQL Editor中执行：
UPDATE users SET role = 'ADMIN' WHERE username = '你的用户名';
```

方法2：直接在SQL Editor中创建
```sql
INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  '$2a$10$YourHashedPasswordHere',  -- 使用bcrypt哈希后的密码
  'ADMIN'
);
```

### 5. 测试API

访问 http://localhost:3000

**测试认证:**
- 注册: POST /api/auth/register
- 登录: POST /api/auth/login
- 获取用户信息: GET /api/auth/me

**测试功能:**
- 查看卡包: GET /api/packs
- 开包: POST /api/packs/open
- 聊天室列表: GET /api/rooms
- 发送消息: POST /api/rooms/:id/messages

## API 文档

完整的API文档请参考:
- `API_SPECIFICATION.md` - 详细的API接口规范
- `DATABASE_DESIGN.md` - 数据库设计文档
- `PROJECT_SPECIFICATION.md` - 项目规范
- `FEATURES.md` - 功能说明

## 主要功能

### 用户功能
- ✅ 注册/登录（支持邀请码）
- ✅ 查看个人资料和统计
- ✅ 开卡包获得单词
- ✅ 查看单词库存（支持筛选、搜索）
- ✅ 在聊天室发送单词消息
- ✅ 给消息送花/取消送花
- ✅ 实时接收新消息

### 管理员功能
- ✅ 用户管理（封禁/解封、赠送卡包）
- ✅ 单词管理（增删改查）
- ✅ 单词书管理
- ✅ 卡包管理（增删改查）
- ✅ 聊天室管理（增删改查、配置单词书）
- ✅ 统计面板

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据库**: Supabase (PostgreSQL)
- **实时通信**: Supabase Realtime
- **认证**: JWT + bcrypt
- **API**: Next.js API Routes

## 下一步

前端组件已经创建好框架，但需要：
1. 集成API调用（使用 `lib/api.ts` 中的函数）
2. 添加Realtime订阅（使用 `lib/supabase.ts` 中的函数）
3. 完善UI交互和样式

## 常见问题

### Q: 如何添加更多单词？
A: 管理员登录后，使用 POST /api/admin/words 接口批量导入，或在后台页面逐个添加。

### Q: 如何配置卡包概率？
A: 编辑卡包时，修改 `rarityWeights` 字段，例如 `{"COMMON": 60, "RARE": 30, "EPIC": 8, "LEGENDARY": 2}`

### Q: 消息没有实时更新？
A: 检查Supabase Dashboard中的Realtime是否已启用。

### Q: 如何修改聊天室的单词范围？
A: 管理员可以通过 PUT /api/admin/rooms/:id 接口修改关联的单词书。

## 联系支持

如有问题，请参考项目文档或检查控制台日志。
