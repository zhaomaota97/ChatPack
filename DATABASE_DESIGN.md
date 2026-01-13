# ChatPack - 数据库设计文档

## 概述

本文档详细描述 ChatPack（单词十连抽）项目的数据库设计，包括表结构、枚举类型、函数、触发器和安全策略。

数据库: PostgreSQL (Supabase)

---

## 目录

1. [枚举类型](#枚举类型-enums)
2. [核心表结构](#核心表结构)
   - [users - 用户表](#1-users---用户表)
   - [wordbooks - 单词书表](#2-wordbooks---单词书表)
   - [words - 单词表](#3-words---单词表)
   - [wordbook_words - 关联表](#4-wordbook_words---单词书-单词关联表)
   - [user_words - 用户单词库存表](#5-user_words---用户单词库存表)
   - [packs - 卡包表](#6-packs---卡包表)
   - [user_packs - 用户卡包库存表](#7-user_packs---用户卡包库存表)
   - [chat_rooms - 聊天室表](#8-chat_rooms---聊天室表)
   - [messages - 消息表](#9-messages---消息表)
   - [rose_transactions - 送花记录表](#10-rose_transactions---送花记录表)
3. [数据库函数](#数据库函数)
4. [触发器](#触发器)
5. [Row Level Security (RLS)](#row-level-security-rls-策略)
6. [初始数据](#初始数据)
7. [数据导入](#数据导入)

---

## 枚举类型 (ENUMs)

### 1. user_role - 用户角色

```sql
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
```

- `USER`: 普通用户
- `ADMIN`: 管理员

### 2. rarity - 单词稀有度

```sql
CREATE TYPE rarity AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
```

- `COMMON`: 普通（白色）
- `RARE`: 稀有（蓝色）
- `EPIC`: 史诗（紫色）
- `LEGENDARY`: 传说（金色）

### 3. wordbook_level - 单词书等级

```sql
CREATE TYPE wordbook_level AS ENUM (
  'PRIMARY',      -- 小学
  'MIDDLE',       -- 初中
  'HIGH',         -- 高中
  'CET4',         -- 四级
  'CET6',         -- 六级
  'POSTGRADUATE'  -- 考研
);
```

---

## 核心表结构

### 1. users - 用户表

存储用户基本信息和统计数据。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 认证信息
  username VARCHAR(50) UNIQUE NOT NULL,           -- 用户名（唯一）
  password_hash VARCHAR(255) NOT NULL,            -- 密码哈希
  
  -- 个人资料
  nickname VARCHAR(50),                           -- 昵称（可选）
  avatar TEXT,                                    -- 头像URL
  
  -- 权限
  role user_role DEFAULT 'USER' NOT NULL,         -- 用户角色
  is_banned BOOLEAN DEFAULT false NOT NULL,       -- 是否被封禁
  
  -- 统计
  total_roses INTEGER DEFAULT 0 NOT NULL,         -- 总获得鲜花数
  total_packs_opened INTEGER DEFAULT 0 NOT NULL,  -- 总开包数
  
  -- 邀请系统
  invite_code VARCHAR(8) UNIQUE NOT NULL,         -- 邀请码（自动生成）
  invited_by UUID REFERENCES users(id),           -- 邀请人
  
  -- 时间戳
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_role ON users(role);
```

**字段说明:**
- `username`: 用户登录名，3-50字符，全局唯一
- `password_hash`: 使用 bcrypt 加密的密码
- `nickname`: 显示名称，优先于 username 显示
- `avatar`: 头像图片URL
- `role`: USER 或 ADMIN
- `is_banned`: 封禁状态
- `total_packs_opened`: 累计开包数量
- `invite_code`: 8位随机邀请码
- `invited_by`: 邀请人用户ID

### 2. wordbooks - 单词书表

单词书分级信息。

```sql
CREATE TABLE wordbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,                    -- 单词书名称
  level wordbook_level NOT NULL,                  -- 单词书等级
  description TEXT,                               -- 描述
  order_index INTEGER NOT NULL,                   -- 排序索引（小学=1，初中=2...）
  is_active BOOLEAN DEFAULT true NOT NULL,        -- 是否启用
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(level)
);

CREATE INDEX idx_wordbooks_level ON wordbooks(level);
CREATE INDEX idx_wordbooks_order ON wordbooks(order_index);
```

**字段说明:**
- `level`: 单词书等级，全局唯一
- `order_index`: 用于排序和判断等级高低（1-6）
- `is_active`: 是否启用，禁用后不在前端显示

### 3. words - 单词表

存储所有单词数据。

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(100) UNIQUE NOT NULL,             -- 单词
  definition TEXT NOT NULL,                       -- 中文释义
  pronunciation VARCHAR(100),                     -- 音标
  rarity rarity NOT NULL,                         -- 稀有度
  example_sentence TEXT,                          -- 例句
  
  -- 多媒体资源
  image_url TEXT,                                 -- 卡牌图片URL（卡面）
  audio_url TEXT,                                 -- 发音音频URL
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_rarity ON words(rarity);
CREATE UNIQUE INDEX idx_words_word_lower ON words(LOWER(word));
```

**字段说明:**
- `word`: 单词本身，全局唯一（不区分大小写）
- `definition`: 中文释义
- `pronunciation`: 音标（可选）
- `rarity`: 稀有度（影响开包概率）
- `example_sentence`: 例句（可选）

### 4. wordbook_words - 单词书-单词关联表

多对多关系表。

```sql
CREATE TABLE wordbook_words (
  wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (wordbook_id, word_id)
);

CREATE INDEX idx_wordbook_words_wordbook ON wordbook_words(wordbook_id);
CREATE INDEX idx_wordbook_words_word ON wordbook_words(word_id);
```

**说明:**
- 一个单词可以属于多个单词书
- 删除单词书或单词时自动删除关联

### 5. user_words - 用户单词库存表

用户拥有的单词。

```sql
CREATE TABLE user_words (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  
  is_favorited BOOLEAN DEFAULT false NOT NULL,    -- 是否收藏
  obtained_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- 获得时间
  
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX idx_user_words_user ON user_words(user_id);
CREATE INDEX idx_user_words_word ON user_words(word_id);
CREATE INDEX idx_user_words_favorited ON user_words(user_id, is_favorited);
```

**字段说明:**
- `is_favorited`: 用户可以收藏单词便于查找
- `obtained_at`: 记录获得时间

### 6. packs - 卡包表

卡包类型定义（分为普通卡包和特殊卡包）。

```sql
CREATE TYPE pack_type AS ENUM ('NORMAL', 'SPECIAL');

CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  card_count INTEGER NOT NULL DEFAULT 5,          -- 每包卡片数量（默认5张）
  
  -- 卡包类型
  pack_type pack_type NOT NULL DEFAULT 'SPECIAL', -- NORMAL: 普通卡包, SPECIAL: 特殊卡包
  
  -- 卡包限定的稀有度（仅特殊卡包使用，普通卡包此字段可为NULL）
  rarity_type rarity,                             -- 特殊卡包的稀有度类型
  
  -- 普通卡包的稀有度权重配置（JSON格式，仅普通卡包使用）
  rarity_weights JSONB,                           -- 例: {"COMMON": 60, "RARE": 30, "EPIC": 8, "LEGENDARY": 2}
  
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- 特殊卡包的rarity_type必须唯一
  UNIQUE(rarity_type),
  
  -- 约束：特殊卡包必须有rarity_type，普通卡包必须有rarity_weights
  CHECK (
    (pack_type = 'SPECIAL' AND rarity_type IS NOT NULL AND rarity_weights IS NULL) OR
    (pack_type = 'NORMAL' AND rarity_type IS NULL AND rarity_weights IS NOT NULL)
  )
);

CREATE INDEX idx_packs_active ON packs(is_active);
CREATE INDEX idx_packs_type ON packs(pack_type);
CREATE INDEX idx_packs_rarity ON packs(rarity_type);
```

**字段说明:**
- `pack_type`: 卡包类型
  - `NORMAL`: 普通卡包，能开出所有稀有度的单词，越稀有的越难开出（通过rarity_weights控制概率）
  - `SPECIAL`: 特殊卡包，只能开出对应稀有度的单词（如稀有卡包、传说卡包等）
- `card_count`: 每次开包获得的卡片数量
- `rarity_type`: 特殊卡包限定的稀有度（仅SPECIAL类型使用）
- `rarity_weights`: 普通卡包的稀有度权重配置，JSON格式（仅NORMAL类型使用）
  - 例如: `{"COMMON": 60, "RARE": 30, "EPIC": 8, "LEGENDARY": 2}` 表示普通60%、稀有30%、史诗8%、传说2%的概率

### 7. user_packs - 用户卡包库存表

用户拥有的卡包。

```sql
CREATE TABLE user_packs (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0 NOT NULL,
  
  PRIMARY KEY (user_id, pack_id)
);

CREATE INDEX idx_user_packs_user ON user_packs(user_id);
```

**字段说明:**
- `count`: 拥有的卡包数量

### 8. chat_rooms - 聊天室表

聊天室定义（管理员通过后台配置管理）。

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);
```

**字段说明:**
- `name`: 聊天室名称（管理员可自定义，如"小学乐园"、"考研专区"等）
- `description`: 聊天室描述（管理员可自定义）
- `is_active`: 是否启用该聊天室

**管理规则:**
- 聊天室在后台页面配置，管理员可自由创建任意名称和描述的聊天室
- 聊天室通过 `chat_room_wordbooks` 中间表关联单词书，决定可用单词范围
- 用户在聊天室中只能发送该聊天室关联的单词书中包含的单词
- 管理员可以对聊天室进行完整的增删改查操作：
  - **创建**: 创建聊天室并配置关联的单词书
  - **修改**: 更新名称、描述、启用状态、关联的单词书
  - **删除**: 删除聊天室及其所有消息记录和关联关系
  - **查询**: 查看所有聊天室列表及其关联的单词书

### 8.1. chat_room_wordbooks - 聊天室单词书关联表

定义聊天室可使用的单词书范围。

```sql
CREATE TABLE chat_room_wordbooks (
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
  
  PRIMARY KEY (room_id, wordbook_id)
);

CREATE INDEX idx_chat_room_wordbooks_room ON chat_room_wordbooks(room_id);
CREATE INDEX idx_chat_room_wordbooks_wordbook ON chat_room_wordbooks(wordbook_id);
```

**字段说明:**
- `room_id`: 聊天室ID
- `wordbook_id`: 单词书ID
- 一个聊天室可以关联多个单词书
- 用户在聊天室发送消息时，单词必须属于该聊天室关联的任意一个单词书

### 9. messages - 消息表

聊天消息记录。

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,                          -- 消息内容（单词）
  roses INTEGER DEFAULT 0 NOT NULL,               -- 收到的鲜花数
  
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- 消息关联
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_room ON messages(room_id, timestamp DESC);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

**字段说明:**
- `content`: 消息内容，必须是单个单词
- `roses`: 该消息收到的鲜花总数
- `reply_to_id`: 回复的消息ID（可选）

### 10. rose_transactions - 送花记录表

记录用户送花行为（可取消）。

```sql
CREATE TABLE rose_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(message_id, sender_id)
);

CREATE INDEX idx_rose_transactions_message ON rose_transactions(message_id);
CREATE INDEX idx_rose_transactions_sender ON rose_transactions(sender_id);
```

**字段说明:**
- `message_id`: 送花的消息ID
- `sender_id`: 送花者ID
- UNIQUE 约束确保每个用户对每条消息只能送一朵花
- 删除记录即为取消送花

---

## 数据库函数

### 1. generate_invite_code() - 生成唯一邀请码

```sql
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- 生成8位随机码（大写字母+数字）
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- 检查是否已存在
    SELECT EXISTS(SELECT 1 FROM users WHERE invite_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 2. get_available_words_for_room() - 获取用户可用单词

根据聊天室环境获取用户可用的单词列表。

```sql
CREATE OR REPLACE FUNCTION get_available_words_for_room(
  p_user_id UUID,
  p_room_environment room_environment
)
RETURNS TABLE(word_id UUID, word TEXT, definition TEXT, rarity rarity) AS $$
DECLARE
  max_level_order INTEGER;
BEGIN
  -- 获取该环境对应的最大单词书等级
  SELECT order_index INTO max_level_order
  FROM wordbooks
  WHERE level = p_room_environment::TEXT::wordbook_level;
  
  -- 返回用户拥有的、且属于该环境及以下等级单词书的单词
  RETURN QUERY
  SELECT DISTINCT w.id, w.word, w.definition, w.rarity
  FROM words w
  INNER JOIN user_words uw ON w.id = uw.word_id
  INNER JOIN wordbook_words ww ON w.id = ww.word_id
  INNER JOIN wordbooks wb ON ww.wordbook_id = wb.id
  WHERE uw.user_id = p_user_id
    AND wb.order_index <= max_level_order
    AND wb.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

### 3. draw_words_from_pack() - 开卡包抽取单词

从卡包中按配置的概率随机抽取单词。

**参数说明:**
- `p_user_id`: 用户ID
- `p_pack_id`: 卡包ID（用于后续扩展，如记录开包日志）
- `p_card_count`: 抽取数量（对应 packs 表的 `card_count` 字段，固定为5）
- `p_rarity_weights`: 稀有度权重配置（对应 packs 表的 `rarity_weights` 字段）

```sql
CREATE OR REPLACE FUNCTION draw_words_from_pack(
  p_user_id UUID,
  p_pack_id UUID,
  p_card_count INTEGER,
  p_rarity_weights JSONB
)
RETURNS TABLE(word_id UUID, word TEXT, definition TEXT, rarity rarity, is_new BOOLEAN) AS $$
DECLARE
  drawn_word_ids UUID[];
  v_rarity rarity;
  i INTEGER;
BEGIN
  drawn_word_ids := ARRAY[]::UUID[];
  
  -- 按权重随机抽取各稀有度的单词
  FOR i IN 1..p_card_count LOOP
    -- 根据权重随机决定稀有度
    WITH weighted_rarities AS (
      SELECT 
        unnest(ARRAY['COMMON', 'RARE', 'EPIC', 'LEGENDARY']::rarity[]) as rarity_val,
        unnest(ARRAY[
          (p_rarity_weights->>'COMMON')::INTEGER,
          (p_rarity_weights->>'RARE')::INTEGER,
          (p_rarity_weights->>'EPIC')::INTEGER,
          (p_rarity_weights->>'LEGENDARY')::INTEGER
        ]) as weight
    ),
    cumulative_weights AS (
      SELECT 
        rarity_val,
        SUM(weight) OVER (ORDER BY rarity_val) as cumsum,
        SUM(weight) OVER () as total
      FROM weighted_rarities
    )
    SELECT rarity_val INTO v_rarity
    FROM cumulative_weights
    WHERE (RANDOM() * total) <= cumsum
    ORDER BY cumsum
    LIMIT 1;
    
    -- 抽取该稀有度的单词
    WITH selected_word AS (
      SELECT w.id
      FROM words w
      WHERE w.rarity = v_rarity
        AND NOT EXISTS (
          SELECT 1 FROM user_words uw
          WHERE uw.user_id = p_user_id AND uw.word_id = w.id
        )
        AND w.id != ALL(drawn_word_ids) -- 避免本次抽取重复
      ORDER BY RANDOM()
      LIMIT 1
    )
    SELECT ARRAY_APPEND(drawn_word_ids, sw.id) INTO drawn_word_ids
    FROM selected_word sw;
  END LOOP;
  
  -- 如果没有抽到单词，返回空
  IF drawn_word_ids IS NULL OR ARRAY_LENGTH(drawn_word_ids, 1) = 0 THEN
    RETURN;
  END IF;
  
  -- 添加到用户库存
  INSERT INTO user_words (user_id, word_id)
  SELECT p_user_id, UNNEST(drawn_word_ids)
  ON CONFLICT (user_id, word_id) DO NOTHING;
  
  -- 返回抽取的单词
  RETURN QUERY
  SELECT w.id, w.word, w.definition, w.rarity, true AS is_new
  FROM words w
  WHERE w.id = ANY(drawn_word_ids);
END;
$$ LANGUAGE plpgsql;
```

---

## 触发器

### 1. 自动更新 updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wordbooks_updated_at
  BEFORE UPDATE ON wordbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 2. 自动生成邀请码

```sql
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_invite_code
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION set_invite_code();
```

---

## Row Level Security (RLS) 策略

### 启用 RLS

```sql
-- 启用所有表的 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbook_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rose_transactions ENABLE ROW LEVEL SECURITY;
```

### Users 表策略

```sql
-- 所有人可以查看用户公开信息
CREATE POLICY "用户可以查看所有用户公开信息" ON users
  FOR SELECT USING (true);

-- 用户可以更新自己的信息
CREATE POLICY "用户可以更新自己的信息" ON users
  FOR UPDATE USING (auth.uid()::TEXT = id::TEXT);

-- 管理员可以管理所有用户
CREATE POLICY "管理员可以管理用户" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### Words 表策略

```sql
-- 所有人可以查看单词
CREATE POLICY "所有人可以查看单词" ON words
  FOR SELECT USING (true);

-- 管理员可以管理单词
CREATE POLICY "管理员可以管理单词" ON words
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### Wordbooks 表策略

```sql
-- 所有人可以查看启用的单词书
CREATE POLICY "所有人可以查看单词书" ON wordbooks
  FOR SELECT USING (is_active = true);

-- 管理员可以管理单词书
CREATE POLICY "管理员可以管理单词书" ON wordbooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### Wordbook_words 表策略

```sql
-- 所有人可以查看单词书单词关联
CREATE POLICY "所有人可以查看单词书单词关联" ON wordbook_words
  FOR SELECT USING (true);

-- 管理员可以管理单词书单词关联
CREATE POLICY "管理员可以管理单词书单词关联" ON wordbook_words
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### User_words 表策略

```sql
-- 用户可以查看自己的单词
CREATE POLICY "用户可以查看自己的单词" ON user_words
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

-- 系统可以添加用户单词
CREATE POLICY "系统可以添加用户单词" ON user_words
  FOR INSERT WITH CHECK (true);

-- 用户可以更新自己的单词（收藏）
CREATE POLICY "用户可以更新自己的单词" ON user_words
  FOR UPDATE USING (auth.uid()::TEXT = user_id::TEXT);
```

### Packs 表策略

```sql
-- 所有人可以查看启用的卡包
CREATE POLICY "所有人可以查看卡包" ON packs
  FOR SELECT USING (is_active = true);

-- 管理员可以管理卡包
CREATE POLICY "管理员可以管理卡包" ON packs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### User_packs 表策略

```sql
-- 用户可以查看自己的卡包
CREATE POLICY "用户可以查看自己的卡包" ON user_packs
  FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);

-- 系统可以管理用户卡包
CREATE POLICY "系统可以管理用户卡包" ON user_packs
  FOR ALL USING (true);
```

### Chat_rooms 表策略

```sql
-- 所有人可以查看启用的聊天室
CREATE POLICY "所有人可以查看聊天室" ON chat_rooms
  FOR SELECT USING (is_active = true);

-- 管理员可以管理聊天室
CREATE POLICY "管理员可以管理聊天室" ON chat_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### Messages 表策略

```sql
-- 所有人可以查看消息
CREATE POLICY "所有人可以查看消息" ON messages
  FOR SELECT USING (true);

-- 用户可以发送消息
CREATE POLICY "用户可以发送消息" ON messages
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- 用户可以删除自己的消息
CREATE POLICY "用户可以删除自己的消息" ON messages
  FOR DELETE USING (auth.uid()::TEXT = user_id::TEXT);

-- 管理员可以删除任何消息
CREATE POLICY "管理员可以删除任何消息" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::TEXT = auth.uid()::TEXT AND role = 'ADMIN'
    )
  );
```

### Rose_transactions 表策略

```sql
-- 所有人可以查看送花记录
CREATE POLICY "所有人可以查看送花记录" ON rose_transactions
  FOR SELECT USING (true);

-- 用户可以送花
CREATE POLICY "用户可以送花" ON rose_transactions
  FOR INSERT WITH CHECK (auth.uid()::TEXT = sender_id::TEXT);

-- 用户可以取消自己的送花
CREATE POLICY "用户可以取消自己的送花" ON rose_transactions
  FOR DELETE USING (auth.uid()::TEXT = sender_id::TEXT);
```

---

## 初始数据

### 1. 初始化单词书

```sql
INSERT INTO wordbooks (name, level, description, order_index) VALUES
  ('小学词汇', 'PRIMARY', '小学阶段常用英语单词', 1),
  ('初中词汇', 'MIDDLE', '初中阶段常用英语单词', 2),
  ('高中词汇', 'HIGH', '高中阶段常用英语单词', 3),
  ('大学英语四级', 'CET4', '大学英语四级考试词汇', 4),
  ('大学英语六级', 'CET6', '大学英语六级考试词汇', 5),
  ('考研英语', 'POSTGRADUATE', '研究生入学考试英语词汇', 6);
```

### 2. 初始化聊天室

```sql
INSERT INTO chat_rooms (name, environment, description) VALUES
  ('小学乐园', 'PRIMARY', '适合小学水平的聊天室，只能使用小学单词'),
  ('初中世界', 'MIDDLE', '适合初中水平的聊天室，可使用小学和初中单词'),
  ('高中殿堂', 'HIGH', '适合高中水平的聊天室，可使用高中及以下单词'),
  ('四级广场', 'CET4', '适合四级水平的聊天室，可使用四级及以下单词'),
  ('六级天地', 'CET6', '适合六级水平的聊天室，可使用六级及以下单词'),
  ('考研领域', 'POSTGRADUATE', '适合考研水平的聊天室，可使用所有等级单词');
```

### 3. 初始化卡包

```sql
INSERT INTO packs (name, description, card_count, rarity_type) VALUES
  (
    '普通卡包',
    '包含5张普通稀有度单词卡片',
    5,
    'COMMON'
  ),
  (
    '稀有卡包',
    '包含5张稀有稀有度单词卡片',
    5,
    'RARE'
  ),
  (
    '史诗卡包',
    '包含5张史诗稀有度单词卡片',
    5,
    'EPIC'
  ),
  (
    '传说卡包',
    '包含5张传说稀有度单词卡片',
    5,
    'LEGENDARY'
  );
```

---

## 数据导入

### 单词数据格式

推荐使用 CSV 或 JSON 格式批量导入单词：

**CSV 格式示例:**
```csv
word,definition,pronunciation,rarity,wordbooks
hello,你好,həˈləʊ,COMMON,PRIMARY;MIDDLE
world,世界,wɜːld,COMMON,PRIMARY;MIDDLE
apple,苹果,ˈæpl,COMMON,PRIMARY
...
```

**JSON 格式示例:**
```json
[
  {
    "word": "hello",
    "definition": "你好",
    "pronunciation": "həˈləʊ",
    "rarity": "COMMON",
    "wordbookLevels": ["PRIMARY", "MIDDLE"]
  }
]
```

---

## ER 图关系说明

```
users (1) ----< (N) user_words (N) >---- (1) words
users (1) ----< (N) user_packs (N) >---- (1) packs
users (1) ----< (N) messages (N) >---- (1) chat_rooms
words (N) ----< (N) wordbook_words (N) >---- (1) wordbooks
users (1) ----< (N) users (invited_by)
messages (1) ----< (N) messages (reply_to_id)
```

---

**文档版本**: 2.0  
**更新日期**: 2026-01-12  
**作者**: GitHub Copilot
