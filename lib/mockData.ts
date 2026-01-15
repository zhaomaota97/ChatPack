import { Word } from '@/lib/types'

export const mockWords: Word[] = [
  {
    word: 'hello',
    meaning: '你好',
    phonetic: '/həˈləʊ/',
    rarity: 'COMMON',
    books: ['primary'],
    example: 'Hello, how are you?',
  },
  {
    word: 'world',
    meaning: '世界',
    phonetic: '/wɜːld/',
    rarity: 'COMMON',
    books: ['primary'],
    example: 'Welcome to the world.',
  },
  {
    word: 'beautiful',
    meaning: '美丽的',
    phonetic: '/ˈbjuːtɪfl/',
    rarity: 'RARE',
    books: ['middle'],
    example: 'What a beautiful day!',
  },
  {
    word: 'extraordinary',
    meaning: '非凡的',
    phonetic: '/ɪkˈstrɔːdnri/',
    rarity: 'EPIC',
    books: ['high'],
    example: 'An extraordinary achievement.',
  },
  {
    word: 'serendipity',
    meaning: '意外发现珍奇事物的本领',
    phonetic: '/ˌserənˈdɪpəti/',
    rarity: 'LEGENDARY',
    books: ['cet6'],
    example: 'Finding you was pure serendipity.',
  },
]
