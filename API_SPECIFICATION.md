# ChatPack - API 接口规范文档

## 概述

本文档定义 ChatPack（单词十连抽）项目所有的 RESTful API 接口规范。

**基础信息:**
- 基础路径: `/api`
- 认证方式: JWT Token (Cookie)
- 内容类型: `application/json`
- 字符编码: `UTF-8`

---

## 目录

1. [认证接口](#认证接口)
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/logout
   - GET /api/auth/me
2. [单词接口](#单词接口)
   - GET /api/words
   - POST /api/words
   - PUT /api/words/:id
   - DELETE /api/words/:id
   - POST /api/words/batch-import
3. [单词书接口](#单词书接口)
   - GET /api/wordbooks
   - GET /api/wordbooks/:id/words
   - PUT /api/wordbooks/:id
   - POST /api/wordbooks/:id/words
   - DELETE /api/wordbooks/:id/words/:wordId
4. [用户单词接口](#用户单词接口)
   - GET /api/users/words
   - PUT /api/users/words/:id/favorite
   - GET /api/users/words/available
5. [卡包接口](#卡包接口)
   - GET /api/packs
   - GET /api/users/packs
   - POST /api/packs/open
6. [聊天室接口](#聊天室接口)
   - GET /api/rooms
   - GET /api/rooms/:id/messages
   - POST /api/rooms/:id/messages
7. [送花接口](#送花接口)
   - POST /api/messages/:id/rose
   - DELETE /api/messages/:id/rose
8. [用户管理接口](#用户管理接口)
   - GET /api/users/me
   - PUT /api/users/me
   - GET /api/users/inventory
8. [管理员接口](#管理员接口)
   - GET /api/admin/users
   - PUT /api/admin/users/:id/ban
   - POST /api/admin/users/:id/packs
   - GET /api/admin/rooms
   - POST /api/admin/rooms
   - PUT /api/admin/rooms/:id
   - DELETE /api/admin/rooms/:id
   - GET /api/admin/packs
   - POST /api/admin/packs
   - PUT /api/admin/packs/:id
   - DELETE /api/admin/packs/:id
   - GET /api/admin/dashboard
9. [错误代码](#错误代码)
10. [Realtime 实时事件](#realtime-实时事件)

---

**通用响应格式:**

成功响应:
```json
{
  "success": true,
  "data": { /* 响应数据 */ }
}
```

错误响应:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

---

## 认证接口

### POST /api/auth/register

注册新用户。

**请求体:**
```json
{
  "username": "string",      // 3-50字符，字母数字下划线
  "password": "string",      // 6-100字符
  "inviteCode": "string"     // 可选，8位邀请码
}
```

**验证规则:**
- `username`: 必填，3-50字符，唯一，仅字母数字下划线
- `password`: 必填，6-100字符
- `inviteCode`: 可选，必须存在且有效

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "role": "USER",
    "inviteCode": "string"
  }
}
```

**错误响应:**
- `400`: 参数验证失败
- `409`: 用户名已存在
- `404`: 邀请码不存在

---

### POST /api/auth/login

用户登录。

**请求体:**
```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "role": "USER|ADMIN"
  }
}
```

**注意:** Token 通过 `Set-Cookie` 头设置为 HTTP-only Cookie

**错误响应:**
- `400`: 参数缺失
- `401`: 用户名或密码错误
- `403`: 用户已被封禁

---

### POST /api/auth/logout

用户登出。

**认证:** 需要登录

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### GET /api/auth/me

获取当前用户信息。

**认证:** 需要登录

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "role": "USER|ADMIN",
    "totalPacksOpened": 0,
    "inviteCode": "string",
    "registeredAt": "2026-01-12T00:00:00Z",
    "isBanned": false
  }
}
```

---

## 单词接口

### GET /api/words

获取单词列表（用于管理员查看所有单词）。

**认证:** 需要管理员权限

**查询参数:**
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 50，最大 100
- `search`: 搜索关键词（单词或释义）
- `rarity`: 稀有度筛选 (`COMMON|RARE|EPIC|LEGENDARY`)
- `wordbookId`: 单词书ID筛选

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "uuid",
        "word": "hello",
        "definition": "你好",
        "pronunciation": "həˈləʊ",
        "rarity": "COMMON",
        "exampleSentence": "Hello, world!",
        "imageUrl": "https://example.com/cards/hello.png",
        "audioUrl": "https://example.com/audio/hello.mp3",
        "wordbooks": ["uuid1", "uuid2"],
        "createdAt": "2026-01-12T00:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 50,
    "totalPages": 20
  }
}
```

---

### POST /api/words

创建新单词。

**认证:** 需要管理员权限

**请求体:**
```json
{
  "word": "string",
  "definition": "string",
  "pronunciation": "string",     // 可选
  "rarity": "COMMON|RARE|EPIC|LEGENDARY",
  "exampleSentence": "string",   // 可选
  "imageUrl": "string",          // 可选，卡牌图片URL
  "audioUrl": "string",          // 可选，发音音频URL
  "wordbookIds": ["uuid"]        // 至少一个
}
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "word": "hello"
  }
}
```

**错误响应:**
- `400`: 参数验证失败
- `409`: 单词已存在

---

### PUT /api/words/:id

更新单词信息。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词ID

**请求体:**（所有字段可选）
```json
{
  "word": "string",
  "definition": "string",
  "pronunciation": "string",
  "rarity": "COMMON|RARE|EPIC|LEGENDARY",
  "exampleSentence": "string",
  "wordbookIds": ["uuid"]
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

---

### DELETE /api/words/:id

删除单词。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词ID

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### POST /api/words/batch-import

批量导入单词。

**认证:** 需要管理员权限

**请求体:**
```json
{
  "words": [
    {
      "word": "string",
      "definition": "string",
      "pronunciation": "string",
      "rarity": "COMMON",
      "exampleSentence": "string",
      "wordbookIds": ["uuid"]
    }
  ]
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "imported": 100,
    "failed": 2,
    "errors": [
      {
        "word": "test",
        "error": "单词已存在"
      }
    ]
  }
}
```

---

## 单词书接口

### GET /api/wordbooks

获取所有启用的单词书。

**认证:** 不需要

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "小学词汇",
      "level": "PRIMARY",
      "description": "小学阶段常用英语单词",
      "orderIndex": 1
    }
  ]
}
```

---

### GET /api/wordbooks/:id/words

获取单词书中的所有单词。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词书ID

**查询参数:**
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 50

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "uuid",
        "word": "hello",
        "definition": "你好",
        "rarity": "COMMON"
      }
    ],
    "total": 500,
    "page": 1,
    "limit": 50
  }
}
```

---

### PUT /api/wordbooks/:id

更新单词书信息。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词书ID

**请求体:**（所有字段可选）
```json
{
  "name": "string",
  "description": "string",
  "isActive": true
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### POST /api/wordbooks/:id/words

为单词书添加单词。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词书ID

**请求体:**
```json
{
  "wordIds": ["uuid"]
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "added": 10
  }
}
```

---

### DELETE /api/wordbooks/:id/words/:wordId

从单词书移除单词。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 单词书ID
- `wordId`: 单词ID

**成功响应 (200):**
```json
{
  "success": true
}
```

---

## 用户单词接口

### GET /api/users/words

获取当前用户的单词库存。

**认证:** 需要登录

**查询参数:**
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 50
- `search`: 搜索关键词
- `rarity`: 稀有度筛选
- `favorited`: 是否仅显示收藏 (`true|false`)
- `sortBy`: 排序字段 (`obtainedAt|word|rarity`)，默认 `obtainedAt`
- `sortOrder`: 排序顺序 (`asc|desc`)，默认 `desc`

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "uuid",
        "word": "hello",
        "definition": "你好",
        "pronunciation": "həˈləʊ",
        "rarity": "COMMON",
        "exampleSentence": "Hello!",
        "imageUrl": "https://example.com/cards/hello.png",
        "audioUrl": "https://example.com/audio/hello.mp3",
        "isFavorited": false,
        "obtainedAt": "2026-01-12T00:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "stats": {
      "total": 150,
      "byRarity": {
        "COMMON": 100,
        "RARE": 30,
        "EPIC": 15,
        "LEGENDARY": 5
      }
    }
  }
}
```

---

### PUT /api/users/words/:id/favorite

收藏或取消收藏单词。

**认证:** 需要登录

**路径参数:**
- `id`: 单词ID

**请求体:**
```json
{
  "isFavorited": true
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

**错误响应:**
- `404`: 用户未拥有该单词

---

### GET /api/users/words/available

获取当前用户在指定聊天室可用的单词。

**认证:** 需要登录

**查询参数:**
- `roomId`: 聊天室ID（必填）

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "uuid",
        "word": "hello",
        "definition": "你好",
        "rarity": "COMMON"
      }
    ],
    "total": 50
  }
}
```

---

## 卡包接口

### GET /api/packs

获取所有可用卡包。

**认证:** 不需要

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "卡包",
      "description": "包含5张单词卡片，越稀有的越难开出",
      "cardCount": 5,
      "rarityWeights": {
        "COMMON": 60,
        "RARE": 30,
        "EPIC": 8,
        "LEGENDARY": 2
      }
    },
    {
      "id": "uuid",
      "name": "稀有卡包",
      "description": "包含5张稀有稀有度单词卡片",
      "cardCount": 5,
      "rarityWeights": {
        "COMMON": 0,
        "RARE": 100,
        "EPIC": 0,
        "LEGENDARY": 0
      }
    },
    {
      "id": "uuid",
      "name": "史诗卡包",
      "description": "包含5张史诗稀有度单词卡片",
      "cardCount": 5,
      "rarityWeights": {
        "COMMON": 0,
        "RARE": 0,
        "EPIC": 100,
        "LEGENDARY": 0
      }
    },
    {
      "id": "uuid",
      "name": "传说卡包",
      "description": "包含5张传说稀有度单词卡片",
      "cardCount": 5,
      "rarityWeights": {
        "COMMON": 0,
        "RARE": 0,
        "EPIC": 0,
        "LEGENDARY": 100
      }
    }
  ]
}
```

**字段说明:**
- `cardCount`: 每包固定包含5张卡片
- `rarityWeights`: 各稀有度的抽取权重，总和为100
  - 普通卡包：配置不同权重，实现越稀有越难抽到的效果
  - 特殊卡包：某个稀有度设为100%，其他为0%
```

---

### GET /api/users/packs

获取当前用户的卡包库存。

**认证:** 需要登录

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "packId": "uuid",
      "name": "小学入门包",
      "description": "包含5张小学单词卡片",
      "cardCount": 5,
      "count": 3
    }
  ]
}
```

---

### POST /api/packs/open

开启卡包。

**认证:** 需要登录

**请求体:**
```json
{
  "packId": "uuid"
}
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "id": "uuid",
        "word": "hello",
        "definition": "你好",
        "pronunciation": "həˈləʊ",
        "rarity": "RARE",
        "exampleSentence": "Hello!",
        "isNew": true
      }
    ],
    "summary": {
      "total": 5,
      "newWords": 5,
      "byRarity": {
        "COMMON": 3,
        "RARE": 2,
        "EPIC": 0,
        "LEGENDARY": 0
      }
    }
  }
}
```

**错误响应:**
- `404`: 卡包不存在或不可用
- `400`: 用户没有该卡包
- `400`: 没有可开的新单词

---

## 聊天室接口

### GET /api/rooms

获取所有聊天室。

**认证:** 不需要

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "小学乐园",
      "description": "适合小学水平的聊天室",
      "wordbooks": [
        {
          "id": "uuid",
          "name": "小学词汇",
          "level": "PRIMARY"
        }
      ],
      "onlineCount": 15
    }
  ]
}
```

**注意:** `onlineCount` 通过 Supabase Realtime Presence 实时获取

---

### GET /api/rooms/:id/messages

获取聊天室历史消息。

**认证:** 需要登录

**路径参数:**
- `id`: 聊天室ID

**查询参数:**
- `limit`: 消息数量，默认 100，最大 200
- `before`: 时间戳，用于分页加载更早的消息

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "username": "string",
      "nickname": "string",
      "avatar": "string",
      "content": "hello",
      "roses": 3,
      "timestamp": "2026-01-12T00:00:00Z",
      "replyToId": "uuid",
      "replyTo": {
        "id": "uuid",
        "content": "hi",
        "username": "user2"
      }
    }
  ]
}
```

---

### POST /api/rooms/:id/messages

发送消息。

**认证:** 需要登录

**路径参数:**
- `id`: 聊天室ID

**请求体:**
```json
{
  "content": "hello",
  "replyToId": "uuid"    // 可选
}
```

**验证规则:**
1. `content` 必须是单个单词（无空格）
2. 单词必须在用户库存中
3. 单词必须属于当前聊天室环境允许的等级

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid"
  }
}
```

**错误响应:**
- `400`: 不是单个单词
- `403`: 用户未拥有该单词
- `403`: 单词不适用于当前聊天室

---

## 送花接口

### POST /api/messages/:id/rose

给消息送花。

**认证:** 需要登录

**路径参数:**
- `id`: 消息ID

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "messageRoses": 4,        // 该消息的总鲜花数
    "userTotalRoses": 123     // 发言人的总鲜花数
  }
}
```

**错误响应:**
- `404`: 消息不存在
- `409`: 已经送过花了

**说明:**
- 送花会触发 Realtime 更新
- 消息的 `roses` 字段 +1
- 发言人的 `total_roses` 字段 +1
- 送花不消耗自己的鲜花

---

### DELETE /api/messages/:id/rose

取消送花。

**认证:** 需要登录

**路径参数:**
- `id`: 消息ID

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "messageRoses": 3,        // 该消息的总鲜花数
    "userTotalRoses": 122     // 发言人的总鲜花数
  }
}
```

**错误响应:**
- `404`: 消息不存在或未送过花

**说明:**
- 取消送花会触发 Realtime 更新
- 消息的 `roses` 字段 -1
- 发言人的 `total_roses` 字段 -1

---

## 用户管理接口

### GET /api/users/me

获取当前用户详细信息。

**认证:** 需要登录

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "role": "USER",
    "totalPacksOpened": 10,
    "inviteCode": "ABC12345",
    "invitedBy": "uuid",
    "registeredAt": "2026-01-12T00:00:00Z",
    "lastLoginAt": "2026-01-12T00:00:00Z"
  }
}
```

---

### PUT /api/users/me

更新当前用户资料。

**认证:** 需要登录

**请求体:**（所有字段可选）
```json
{
  "nickname": "string",      // 2-50字符
  "avatar": "string"         // URL
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### GET /api/users/inventory

获取用户库存概览。

**认证:** 需要登录

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "words": {
      "total": 150,
      "byRarity": {
        "COMMON": 100,
        "RARE": 30,
        "EPIC": 15,
        "LEGENDARY": 5
      }
    },
    "packs": {
      "total": 5,
      "byType": {
        "小学入门包": 2,
        "初中进阶包": 3
      }
    }
  }
}
```

---

## 管理员接口

### GET /api/admin/users

获取所有用户列表。

**认证:** 需要管理员权限

**查询参数:**
- `page`: 页码，默认 1
- `limit`: 每页数量，默认 50
- `search`: 搜索用户名或昵称
- `role`: 角色筛选
- `isBanned`: 封禁状态筛选

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "string",
        "nickname": "string",
        "role": "USER",
        "isBanned": false,
        "totalPacksOpened": 10,
        "registeredAt": "2026-01-12T00:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "limit": 50
  }
}
```

---

### PUT /api/admin/users/:id/ban

封禁或解封用户。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 用户ID

**请求体:**
```json
{
  "isBanned": true
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### POST /api/admin/users/:id/packs

为用户添加卡包。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 用户ID

**请求体:**
```json
{
  "packId": "uuid",
  "count": 5
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### GET /api/admin/rooms

获取所有聊天室（包括禁用的）。

**认证:** 需要管理员权限

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "小学乐园",
      "description": "适合小学水平的聊天室",
      "wordbooks": [
        {
          "id": "uuid",
          "name": "小学词汇",
          "level": "PRIMARY"
        }
      ],
      "isActive": true,
      "createdAt": "2026-01-12T00:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/rooms

创建新聊天室（后台配置）。

**认证:** 需要管理员权限

**请求体:**
```json
{
  "name": "string",
  "description": "string",
  "wordbookIds": ["uuid"]  // 关联的单词书ID列表
}
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

**说明:**
- 聊天室可以配置任意名称（如"小学乐园"、"考研专区"等）
- 通过 `wordbookIds` 关联单词书，决定该聊天室可用的单词范围
- 用户在聊天室中只能发送关联的单词书中包含的单词
- 可以关联多个单词书，灵活组合不同等级的单词

---

### PUT /api/admin/rooms/:id

更新聊天室信息。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 聊天室ID

**请求体:**（所有字段可选）
```json
{
  "name": "string",
  "description": "string",
  "wordbookIds": ["uuid"],  // 更新关联的单词书
  "isActive": true
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### DELETE /api/admin/rooms/:id

删除聊天室。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 聊天室ID

**成功响应 (200):**
```json
{
  "success": true
}
```

**说明:**
- 删除聊天室会同时删除该聊天室的所有消息记录和关联关系（级联删除）
- 聊天室列表支持完整的增删改查操作

---

### GET /api/admin/packs

获取所有卡包（包括禁用的）。

**认证:** 需要管理员权限

**成功响应 (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "卡包",
      "description": "包含5张单词卡片",
      "cardCount": 5,
      "rarityWeights": {
        "COMMON": 60,
        "RARE": 30,
        "EPIC": 8,
        "LEGENDARY": 2
      },
      "isActive": true,
      "createdAt": "2026-01-12T00:00:00Z"
    }
  ]
}
```

---

### POST /api/admin/packs

创建新卡包。

**认证:** 需要管理员权限

**请求体:**
```json
{
  "name": "string",
  "description": "string",
  "cardCount": 5,
  "rarityWeights": {
    "COMMON": 60,
    "RARE": 30,
    "EPIC": 8,
    "LEGENDARY": 2
  }
}
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid"
  }
}
```

**说明:**
- `cardCount`: 固定为5张
- `rarityWeights`: 各稀有度权重配置，权重总和建议为100

---

### PUT /api/admin/packs/:id

更新卡包信息。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 卡包ID

**请求体:**（所有字段可选）
```json
{
  "name": "string",
  "description": "string",
  "cardCount": 5,
  "rarityWeights": {
    "COMMON": 60,
    "RARE": 30,
    "EPIC": 8,
    "LEGENDARY": 2
  },
  "isActive": true
}
```

**成功响应 (200):**
```json
{
  "success": true
}
```

---

### DELETE /api/admin/packs/:id

删除卡包。

**认证:** 需要管理员权限

**路径参数:**
- `id`: 卡包ID

**成功响应 (200):**
```json
{
  "success": true
}
```

**注意:** 删除卡包会影响用户库存中对应的卡包记录

---

### GET /api/admin/dashboard

获取管理后台统计数据。

**认证:** 需要管理员权限

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "activeToday": 150,
      "newThisWeek": 50,
      "banned": 5
    },
    "words": {
      "total": 5000,
      "byRarity": {
        "COMMON": 3000,
        "RARE": 1500,
        "EPIC": 400,
        "LEGENDARY": 100
      },
      "byWordbook": {
        "PRIMARY": 800,
        "MIDDLE": 1600,
        "HIGH": 3500,
        "CET4": 4500,
        "CET6": 5500,
        "POSTGRADUATE": 6000
      }
    },
    "packs": {
      "totalOpened": 5000,
      "openedThisWeek": 500,
      "inInventory": 2000
    },
    "messages": {
      "total": 50000,
      "todayCount": 1000,
      "totalRoses": 10000
    },
    "rooms": {
      "total": 6,
      "active": 6,
      "onlineUsers": 150
    }
  }
}
```

---

## 错误代码

| 错误代码 | HTTP 状态码 | 说明 |
|---------|-----------|------|
| `UNAUTHORIZED` | 401 | 未登录或 Token 无效 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 400 | 参数验证失败 |
| `CONFLICT` | 409 | 资源冲突（如用户名已存在） |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `INVALID_WORD` | 400 | 单词不合法 |
| `WORD_NOT_OWNED` | 403 | 用户未拥有该单词 |
| `WORD_NOT_ALLOWED` | 403 | 单词不适用于当前环境 |
| `NO_PACK` | 400 | 用户没有该卡包 |
| `NO_NEW_WORDS` | 400 | 没有可开的新单词 |
| `USER_BANNED` | 403 | 用户已被封禁 |

---

## Realtime 实时事件

### 聊天室消息

**频道:** `room:{roomId}`

**事件:**
- `postgres_changes:INSERT:messages`: 新消息
- `postgres_changes:UPDATE:messages`: 消息更新（鲜花数变化）
- `postgres_changes:DELETE:messages`: 消息删除

**订阅示例:**
```typescript
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`
  }, handleNewMessage)
  .subscribe()
```

### 在线用户状态

**频道:** `room:{roomId}:presence`

**使用 Supabase Presence API**

---

**文档版本**: 2.0  
**更新日期**: 2026-01-12  
**作者**: GitHub Copilot
