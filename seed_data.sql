-- 添加测试单词书
INSERT INTO wordbooks (id, name, description) VALUES
('wb_primary', '小学词汇', '小学阶段常用单词'),
('wb_middle', '初中词汇', '初中阶段常用单词'),
('wb_high', '高中词汇', '高中阶段常用单词'),
('wb_cet4', '四级词汇', '大学英语四级词汇'),
('wb_cet6', '六级词汇', '大学英语六级词汇'),
('wb_kaoyan', '考研词汇', '考研英语词汇')
ON CONFLICT (id) DO NOTHING;

-- 添加一些测试单词
INSERT INTO words (id, word, definition, pronunciation, rarity, example_sentence) VALUES
('w1', 'apple', '苹果', '/ˈæpl/', 'COMMON', 'I like to eat an apple every day.'),
('w2', 'book', '书', '/bʊk/', 'COMMON', 'She is reading a book.'),
('w3', 'computer', '电脑', '/kəmˈpjuːtər/', 'RARE', 'I work on my computer every day.'),
('w4', 'elephant', '大象', '/ˈelɪfənt/', 'RARE', 'The elephant is a large animal.'),
('w5', 'fantastic', '极好的', '/fænˈtæstɪk/', 'EPIC', 'What a fantastic view!'),
('w6', 'gorgeous', '华丽的', '/ˈɡɔːrdʒəs/', 'EPIC', 'She looks gorgeous tonight.'),
('w7', 'magnificent', '壮丽的', '/mæɡˈnɪfɪsnt/', 'LEGENDARY', 'The palace is magnificent.'),
('w8', 'extraordinary', '非凡的', '/ɪkˈstrɔːrdəneri/', 'LEGENDARY', 'He has extraordinary talent.')
ON CONFLICT (id) DO NOTHING;

-- 关联单词到单词书
INSERT INTO wordbook_words (wordbook_id, word_id) VALUES
('wb_primary', 'w1'),
('wb_primary', 'w2'),
('wb_middle', 'w3'),
('wb_middle', 'w4'),
('wb_high', 'w5'),
('wb_high', 'w6'),
('wb_cet4', 'w7'),
('wb_cet6', 'w8')
ON CONFLICT DO NOTHING;

-- 添加测试卡包
INSERT INTO packs (id, name, description, pack_type, card_count, rarity_weights) VALUES
('pack_normal', '普通卡包', '包含5张随机单词卡', 'NORMAL', 5, '{"COMMON": 60, "RARE": 30, "EPIC": 8, "LEGENDARY": 2}'::jsonb),
('pack_rare', '稀有卡包', '包含5张稀有单词卡', 'SPECIAL', 5, NULL),
('pack_epic', '史诗卡包', '包含5张史诗单词卡', 'SPECIAL', 5, NULL),
('pack_legendary', '传说卡包', '包含5张传说单词卡', 'SPECIAL', 5, NULL)
ON CONFLICT (id) DO NOTHING;

-- 更新特殊卡包的稀有度类型
UPDATE packs SET rarity_type = 'RARE' WHERE id = 'pack_rare';
UPDATE packs SET rarity_type = 'EPIC' WHERE id = 'pack_epic';
UPDATE packs SET rarity_type = 'LEGENDARY' WHERE id = 'pack_legendary';

-- 添加聊天室
INSERT INTO chat_rooms (id, name, description, emoji) VALUES
('room_primary', '小学乐园', '小学生交流区', '🌱'),
('room_middle', '初中世界', '初中生交流区', '🌿'),
('room_high', '高中殿堂', '高中生交流区', '🌳'),
('room_cet4', '四级广场', '四级考生交流区', '🎓'),
('room_cet6', '六级天地', '六级考生交流区', '🏆'),
('room_kaoyan', '考研领域', '考研学生交流区', '👑')
ON CONFLICT (id) DO NOTHING;

-- 给admin用户赠送卡包（假设admin用户已存在）
-- 你需要先通过前端注册admin账号，然后将其ID替换到这里
-- 或者通过管理员功能赠送卡包

COMMENT ON TABLE packs IS '卡包配置表';
COMMENT ON TABLE user_packs IS '用户拥有的卡包';
COMMENT ON TABLE user_words IS '用户收集的单词';
