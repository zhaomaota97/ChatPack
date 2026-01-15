-- ChatPack 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本
-- 注意：此脚本会删除已存在的表和类型，请谨慎执行！

-- =====================================================
-- 0. 清理已存在的对象（按依赖关系倒序删除）
-- =====================================================

-- 删除触发器
DROP TRIGGER IF EXISTS set_user_invite_code ON users;
DROP TRIGGER IF EXISTS update_wordbooks_updated_at ON wordbooks;
DROP TRIGGER IF EXISTS update_words_updated_at ON words;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- 删除函数
DROP FUNCTION IF EXISTS increment_user_roses(UUID, INTEGER);
DROP FUNCTION IF EXISTS draw_words_normal_pack(UUID, UUID, INTEGER, JSONB);
DROP FUNCTION IF EXISTS draw_words_special_pack(UUID, UUID, INTEGER, rarity);
DROP FUNCTION IF EXISTS generate_invite_code();
DROP FUNCTION IF EXISTS set_invite_code();
DROP FUNCTION IF EXISTS update_updated_at();

-- 删除表（按依赖关系倒序）
DROP TABLE IF EXISTS rose_transactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_room_wordbooks CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS user_packs CASCADE;
DROP TABLE IF EXISTS packs CASCADE;
DROP TABLE IF EXISTS user_words CASCADE;
DROP TABLE IF EXISTS wordbook_words CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS wordbooks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 删除枚举类型
DROP TYPE IF EXISTS pack_type CASCADE;
DROP TYPE IF EXISTS wordbook_level CASCADE;
DROP TYPE IF EXISTS rarity CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- 1. 启用 UUID 扩展
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. 创建枚举类型
-- =====================================================

-- 用户角色
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- 单词稀有度
CREATE TYPE rarity AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- 单词书等级
CREATE TYPE wordbook_level AS ENUM (
  'PRIMARY',      -- 小学
  'MIDDLE',       -- 初中
  'HIGH',         -- 高中
  'CET4',         -- 四级
  'CET6',         -- 六级
  'POSTGRADUATE'  -- 考研
);

-- 卡包类型
CREATE TYPE pack_type AS ENUM ('NORMAL', 'SPECIAL');

-- =====================================================
-- 3. 创建核心表结构
-- =====================================================

-- 3.1 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 认证信息
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- 个人资料
  nickname VARCHAR(50),
  avatar TEXT,
  
  -- 权限
  role user_role DEFAULT 'USER' NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  
  -- 统计
  total_roses INTEGER DEFAULT 0 NOT NULL,
  total_packs_opened INTEGER DEFAULT 0 NOT NULL,
  
  -- 邀请系统
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  
  -- 时间戳
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_role ON users(role);

-- 3.2 单词书表
CREATE TABLE wordbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  level wordbook_level NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(level)
);

CREATE INDEX idx_wordbooks_level ON wordbooks(level);
CREATE INDEX idx_wordbooks_order ON wordbooks(order_index);

-- 3.3 单词表
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(100) UNIQUE NOT NULL,
  definition TEXT NOT NULL,
  pronunciation VARCHAR(100),
  rarity rarity NOT NULL,
  example_sentence TEXT,
  
  -- 多媒体资源
  image_url TEXT,
  audio_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_rarity ON words(rarity);
CREATE UNIQUE INDEX idx_words_word_lower ON words(LOWER(word));

-- 3.4 单词书-单词关联表
CREATE TABLE wordbook_words (
  wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (wordbook_id, word_id)
);

CREATE INDEX idx_wordbook_words_wordbook ON wordbook_words(wordbook_id);
CREATE INDEX idx_wordbook_words_word ON wordbook_words(word_id);

-- 3.5 用户单词库存表
CREATE TABLE user_words (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  
  is_favorited BOOLEAN DEFAULT false NOT NULL,
  obtained_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (user_id, word_id)
);

CREATE INDEX idx_user_words_user ON user_words(user_id);
CREATE INDEX idx_user_words_word ON user_words(word_id);
CREATE INDEX idx_user_words_favorited ON user_words(user_id, is_favorited);

-- 3.6 卡包表
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  card_count INTEGER NOT NULL DEFAULT 5,
  
  -- 卡包类型
  pack_type pack_type NOT NULL DEFAULT 'SPECIAL',
  
  -- 卡包限定的稀有度（仅特殊卡包使用）
  rarity_type rarity,
  
  -- 普通卡包的稀有度权重配置（JSON格式，仅普通卡包使用）
  rarity_weights JSONB,
  
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

-- 3.7 用户卡包库存表
CREATE TABLE user_packs (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
  count INTEGER DEFAULT 0 NOT NULL,
  
  PRIMARY KEY (user_id, pack_id)
);

CREATE INDEX idx_user_packs_user ON user_packs(user_id);

-- 3.8 聊天室表
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);

-- 3.9 聊天室-单词书关联表
CREATE TABLE chat_room_wordbooks (
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  wordbook_id UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
  
  PRIMARY KEY (room_id, wordbook_id)
);

CREATE INDEX idx_chat_room_wordbooks_room ON chat_room_wordbooks(room_id);
CREATE INDEX idx_chat_room_wordbooks_wordbook ON chat_room_wordbooks(wordbook_id);

-- 3.10 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  roses INTEGER DEFAULT 0 NOT NULL,
  
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_room ON messages(room_id, timestamp DESC);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- 3.11 送花记录表
CREATE TABLE rose_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(message_id, sender_id)
);

CREATE INDEX idx_rose_transactions_message ON rose_transactions(message_id);
CREATE INDEX idx_rose_transactions_sender ON rose_transactions(sender_id);

-- =====================================================
-- 4. 创建数据库函数
-- =====================================================

-- 4.1 生成唯一邀请码
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

-- 4.2 从卡包抽取单词（特殊卡包）
CREATE OR REPLACE FUNCTION draw_words_special_pack(
  p_user_id UUID,
  p_pack_id UUID,
  p_card_count INTEGER,
  p_rarity_type rarity
)
RETURNS TABLE(word_id UUID, word TEXT, definition TEXT, word_rarity rarity, pronunciation TEXT, example_sentence TEXT, image_url TEXT, audio_url TEXT) AS $$
DECLARE
  drawn_word_ids UUID[];
BEGIN
  -- 从指定稀有度的未拥有单词中随机抽取
  SELECT ARRAY_AGG(w.id) INTO drawn_word_ids
  FROM (
    SELECT w.id
    FROM words w
    WHERE w.rarity = p_rarity_type
      AND NOT EXISTS (
        SELECT 1 FROM user_words uw
        WHERE uw.user_id = p_user_id AND uw.word_id = w.id
      )
    ORDER BY RANDOM()
    LIMIT p_card_count
  ) w;
  
  -- 如果没有足够的单词，返回空
  IF drawn_word_ids IS NULL OR ARRAY_LENGTH(drawn_word_ids, 1) < p_card_count THEN
    -- 尝试抽取已拥有的单词以填充
    SELECT ARRAY_AGG(w.id) INTO drawn_word_ids
    FROM (
      SELECT w.id
      FROM words w
      WHERE w.rarity = p_rarity_type
      ORDER BY RANDOM()
      LIMIT p_card_count
    ) w;
  END IF;
  
  -- 添加到用户库存
  INSERT INTO user_words (user_id, word_id)
  SELECT p_user_id, UNNEST(drawn_word_ids)
  ON CONFLICT (user_id, word_id) DO NOTHING;
  
  -- 返回抽取的单词
  RETURN QUERY
  SELECT w.id, w.word, w.definition, w.rarity, w.pronunciation, w.example_sentence, w.image_url, w.audio_url
  FROM words w
  WHERE w.id = ANY(drawn_word_ids);
END;
$$ LANGUAGE plpgsql;

-- 4.3 从卡包抽取单词（普通卡包）
CREATE OR REPLACE FUNCTION draw_words_normal_pack(
  p_user_id UUID,
  p_pack_id UUID,
  p_card_count INTEGER,
  p_rarity_weights JSONB
)
RETURNS TABLE(word_id UUID, word TEXT, definition TEXT, word_rarity rarity, pronunciation TEXT, example_sentence TEXT, image_url TEXT, audio_url TEXT) AS $$
DECLARE
  drawn_word_ids UUID[];
  v_rarity rarity;
  i INTEGER;
  random_val INTEGER;
  total_weight INTEGER;
  cumsum INTEGER;
BEGIN
  drawn_word_ids := ARRAY[]::UUID[];
  
  -- 计算总权重
  total_weight := (p_rarity_weights->>'COMMON')::INTEGER + 
                  (p_rarity_weights->>'RARE')::INTEGER + 
                  (p_rarity_weights->>'EPIC')::INTEGER + 
                  (p_rarity_weights->>'LEGENDARY')::INTEGER;
  
  -- 按权重随机抽取各稀有度的单词
  FOR i IN 1..p_card_count LOOP
    -- 随机数
    random_val := (RANDOM() * total_weight)::INTEGER;
    cumsum := 0;
    
    -- 根据权重决定稀有度
    cumsum := cumsum + (p_rarity_weights->>'COMMON')::INTEGER;
    IF random_val < cumsum THEN
      v_rarity := 'COMMON'::rarity;
    ELSE
      cumsum := cumsum + (p_rarity_weights->>'RARE')::INTEGER;
      IF random_val < cumsum THEN
        v_rarity := 'RARE'::rarity;
      ELSE
        cumsum := cumsum + (p_rarity_weights->>'EPIC')::INTEGER;
        IF random_val < cumsum THEN
          v_rarity := 'EPIC'::rarity;
        ELSE
          v_rarity := 'LEGENDARY'::rarity;
        END IF;
      END IF;
    END IF;
    
    -- 抽取该稀有度的单词
    WITH selected_word AS (
      SELECT w.id
      FROM words w
      WHERE w.rarity = v_rarity
        AND NOT EXISTS (
          SELECT 1 FROM user_words uw
          WHERE uw.user_id = p_user_id AND uw.word_id = w.id
        )
        AND (drawn_word_ids IS NULL OR w.id != ALL(drawn_word_ids))
      ORDER BY RANDOM()
      LIMIT 1
    )
    SELECT COALESCE(drawn_word_ids || ARRAY[sw.id], ARRAY[sw.id]) INTO drawn_word_ids
    FROM selected_word sw;
  END LOOP;
  
  -- 如果没有抽到足够的单词，补充已拥有的单词
  IF drawn_word_ids IS NULL OR ARRAY_LENGTH(drawn_word_ids, 1) < p_card_count THEN
    WITH remaining_words AS (
      SELECT w.id
      FROM words w
      WHERE drawn_word_ids IS NULL OR w.id != ALL(drawn_word_ids)
      ORDER BY RANDOM()
      LIMIT p_card_count - COALESCE(ARRAY_LENGTH(drawn_word_ids, 1), 0)
    )
    SELECT COALESCE(drawn_word_ids, ARRAY[]::UUID[]) || ARRAY_AGG(rw.id) INTO drawn_word_ids
    FROM remaining_words rw;
  END IF;
  
  -- 添加到用户库存
  INSERT INTO user_words (user_id, word_id)
  SELECT p_user_id, UNNEST(drawn_word_ids)
  ON CONFLICT (user_id, word_id) DO NOTHING;
  
  -- 返回抽取的单词
  RETURN QUERY
  SELECT w.id, w.word, w.definition, w.rarity, w.pronunciation, w.example_sentence, w.image_url, w.audio_url
  FROM words w
  WHERE w.id = ANY(drawn_word_ids);
END;
$$ LANGUAGE plpgsql;

-- 4.4 增加用户鲜花数
CREATE OR REPLACE FUNCTION increment_user_roses(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET total_roses = GREATEST(0, total_roses + amount)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. 创建触发器
-- =====================================================

-- 5.1 自动更新 updated_at
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

-- 5.2 自动生成邀请码
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

-- =====================================================
-- 6. 初始化数据
-- =====================================================

-- 6.1 初始化单词书
INSERT INTO wordbooks (name, level, description, order_index) VALUES
  ('小学词汇', 'PRIMARY', '小学阶段常用英语单词', 1),
  ('初中词汇', 'MIDDLE', '初中阶段常用英语单词', 2),
  ('高中词汇', 'HIGH', '高中阶段常用英语单词', 3),
  ('大学英语四级', 'CET4', '大学英语四级考试词汇', 4),
  ('大学英语六级', 'CET6', '大学英语六级考试词汇', 5),
  ('考研英语', 'POSTGRADUATE', '研究生入学考试英语词汇', 6);

-- 6.2 初始化聊天室（获取单词书ID）
DO $$
DECLARE
  primary_id UUID;
  middle_id UUID;
  high_id UUID;
  cet4_id UUID;
  cet6_id UUID;
  postgrad_id UUID;
  room_primary UUID;
  room_middle UUID;
  room_high UUID;
  room_cet4 UUID;
  room_cet6 UUID;
  room_postgrad UUID;
BEGIN
  -- 获取单词书ID
  SELECT id INTO primary_id FROM wordbooks WHERE level = 'PRIMARY';
  SELECT id INTO middle_id FROM wordbooks WHERE level = 'MIDDLE';
  SELECT id INTO high_id FROM wordbooks WHERE level = 'HIGH';
  SELECT id INTO cet4_id FROM wordbooks WHERE level = 'CET4';
  SELECT id INTO cet6_id FROM wordbooks WHERE level = 'CET6';
  SELECT id INTO postgrad_id FROM wordbooks WHERE level = 'POSTGRADUATE';
  
  -- 创建聊天室
  INSERT INTO chat_rooms (name, description) VALUES
    ('小学乐园', '适合小学水平的聊天室，只能使用小学单词')
    RETURNING id INTO room_primary;
  
  INSERT INTO chat_rooms (name, description) VALUES
    ('初中世界', '适合初中水平的聊天室，可使用小学和初中单词')
    RETURNING id INTO room_middle;
  
  INSERT INTO chat_rooms (name, description) VALUES
    ('高中殿堂', '适合高中水平的聊天室，可使用高中及以下单词')
    RETURNING id INTO room_high;
  
  INSERT INTO chat_rooms (name, description) VALUES
    ('四级广场', '适合四级水平的聊天室，可使用四级及以下单词')
    RETURNING id INTO room_cet4;
  
  INSERT INTO chat_rooms (name, description) VALUES
    ('六级天地', '适合六级水平的聊天室，可使用六级及以下单词')
    RETURNING id INTO room_cet6;
  
  INSERT INTO chat_rooms (name, description) VALUES
    ('考研领域', '适合考研水平的聊天室，可使用所有等级单词')
    RETURNING id INTO room_postgrad;
  
  -- 关联单词书
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_primary, primary_id);
  
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_middle, primary_id),
    (room_middle, middle_id);
  
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_high, primary_id),
    (room_high, middle_id),
    (room_high, high_id);
  
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_cet4, primary_id),
    (room_cet4, middle_id),
    (room_cet4, high_id),
    (room_cet4, cet4_id);
  
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_cet6, primary_id),
    (room_cet6, middle_id),
    (room_cet6, high_id),
    (room_cet6, cet4_id),
    (room_cet6, cet6_id);
  
  INSERT INTO chat_room_wordbooks (room_id, wordbook_id) VALUES
    (room_postgrad, primary_id),
    (room_postgrad, middle_id),
    (room_postgrad, high_id),
    (room_postgrad, cet4_id),
    (room_postgrad, cet6_id),
    (room_postgrad, postgrad_id);
END $$;

-- 6.3 初始化卡包
INSERT INTO packs (name, description, card_count, pack_type, rarity_type) VALUES
  ('普通卡包', '包含5张普通稀有度单词卡片', 5, 'SPECIAL', 'COMMON'),
  ('稀有卡包', '包含5张稀有稀有度单词卡片', 5, 'SPECIAL', 'RARE'),
  ('史诗卡包', '包含5张史诗稀有度单词卡片', 5, 'SPECIAL', 'EPIC'),
  ('传说卡包', '包含5张传说稀有度单词卡片', 5, 'SPECIAL', 'LEGENDARY');

-- 添加一个普通类型卡包（混合稀有度）
INSERT INTO packs (name, description, card_count, pack_type, rarity_weights) VALUES
  ('混合卡包', '包含5张随机稀有度单词卡片，越稀有越难开出', 5, 'NORMAL', 
   '{"COMMON": 60, "RARE": 30, "EPIC": 8, "LEGENDARY": 2}'::jsonb);

-- 6.4 创建示例单词
INSERT INTO words (word, definition, pronunciation, rarity, example_sentence) VALUES
  ('hello', '你好', 'həˈloʊ', 'COMMON', 'Hello, how are you?'),
  ('world', '世界', 'wɜːrld', 'COMMON', 'Welcome to the world!'),
  ('apple', '苹果', 'ˈæpl', 'COMMON', 'I like to eat an apple.'),
  ('book', '书', 'bʊk', 'COMMON', 'This is a good book.'),
  ('cat', '猫', 'kæt', 'COMMON', 'I have a cute cat.'),
  ('beautiful', '美丽的', 'ˈbjuːtɪfl', 'RARE', 'She is a beautiful girl.'),
  ('magnificent', '壮丽的', 'mæɡˈnɪfɪsnt', 'EPIC', 'The view was magnificent.'),
  ('extraordinary', '非凡的', 'ɪkˈstrɔːrdəneri', 'LEGENDARY', 'It was an extraordinary achievement.');

-- 关联单词到单词书
DO $$
DECLARE
  primary_id UUID;
  middle_id UUID;
  high_id UUID;
BEGIN
  SELECT id INTO primary_id FROM wordbooks WHERE level = 'PRIMARY';
  SELECT id INTO middle_id FROM wordbooks WHERE level = 'MIDDLE';
  SELECT id INTO high_id FROM wordbooks WHERE level = 'HIGH';
  
  -- 小学单词
  INSERT INTO wordbook_words (wordbook_id, word_id)
  SELECT primary_id, id FROM words WHERE word IN ('hello', 'world', 'apple', 'book', 'cat');
  
  -- 初中单词
  INSERT INTO wordbook_words (wordbook_id, word_id)
  SELECT middle_id, id FROM words WHERE word IN ('beautiful');
  
  -- 高中单词
  INSERT INTO wordbook_words (wordbook_id, word_id)
  SELECT high_id, id FROM words WHERE word IN ('magnificent', 'extraordinary');
END $$;

-- =====================================================
-- 完成初始化
-- =====================================================
-- 数据库初始化完成！
-- 下一步：在应用中实现API接口
