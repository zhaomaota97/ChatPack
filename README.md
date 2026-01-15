# ChatPack - 单词学习游戏平台

基于 React + TypeScript + Next.js + Tailwind CSS + shadcn/ui + Zustand + Supabase 构建的单词学习平台。

## 技术栈

- **Next.js 14** - React框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库
- **Zustand** - 状态管理
- **Supabase** - 后端服务

## 项目结构

```
chatpack-app/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── admin/            # 后台管理组件
│   ├── common/           # 公共组件
│   ├── layout/           # 布局组件
│   └── pages/            # 页面组件
├── lib/                   # 工具函数
│   ├── mockData.ts       # 模拟数据
│   ├── supabase.ts       # Supabase客户端
│   ├── types.ts          # TypeScript类型
│   └── utils.ts          # 工具函数
├── store/                 # Zustand状态管理
│   └── useAppStore.ts    # 应用状态
└── public/               # 静态资源
```

## 功能模块

### 用户端功能
1. **卡包系统** - 开启卡包获取单词
2. **聊天室** - 使用收集的单词进行交流
3. **我的单词** - 查看和管理已收集的单词
4. **词汇库** - 浏览所有单词
5. **生词本** - 收藏和管理生词
6. **个人中心** - 用户资料和统计

### 后台管理功能
1. **数据统计** - 用户和系统数据仪表盘
2. **单词管理** - 添加、编辑、删除单词
3. **单词书管理** - 管理不同级别的单词书
4. **聊天室管理** - 配置聊天室
5. **用户管理** - 管理用户账号
6. **卡包管理** - 配置卡包类型
7. **系统设置** - 全局配置

## 快速开始

### 安装依赖

```bash
cd chatpack-app
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的 Supabase 配置：

```bash
cp .env.example .env.local
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 组件说明

### 布局组件
- `MainLayout` - 主布局容器
- `Sidebar` - 用户端导航栏
- `AdminSidebar` - 后台管理导航栏

### 页面组件
- `PackPage` - 卡包商店页面
- `ChatPage` - 聊天室页面
- `InventoryPage` - 我的单词页面
- `VocabularyPage` - 词汇库页面
- `NotebookPage` - 生词本页面
- `ProfilePage` - 个人中心页面

### 公共组件
- `RarityBadge` - 稀有度徽章
- `WordCard` - 单词卡片
- `WordDetail` - 单词详情弹窗
- `StatItem` - 统计数据项

### 后台组件
- `AdminDashboard` - 数据统计仪表盘
- `AdminWords` - 单词管理
- `AdminWordbooks` - 单词书管理
- `AdminRooms` - 聊天室管理
- `AdminUsers` - 用户管理
- `AdminPacks` - 卡包管理
- `AdminSettings` - 系统设置

## 状态管理

使用 Zustand 进行全局状态管理，主要状态包括：

- 页面导航状态
- 用户库存数据
- 聊天消息列表
- 生词本数据
- 单词详情弹窗
- 后台管理状态

## 注意事项

当前版本为原型实现，特点：

- ✅ 完整实现了UI结构和布局
- ✅ 使用了模拟数据展示功能
- ❌ 未实现实际业务逻辑
- ❌ 未对接Supabase接口
- ❌ 未添加额外的样式美化

## 下一步开发

1. 对接 Supabase 数据库
2. 实现用户认证系统
3. 实现卡包开启逻辑
4. 实现聊天室实时通信
5. 添加单词学习功能
6. 优化UI/UX设计
7. 添加响应式布局
8. 实现数据持久化

## License

MIT
