// API客户端工具函数
import type { 
  ApiResponse, 
  RegisterRequest, 
  LoginRequest, 
  AuthUser,
  User,
  UserWord,
  Pack,
  UserPack,
  OpenPackResponse,
  ChatRoom,
  Message,
  SendMessageRequest,
  Word,
  Wordbook,
  PaginatedResponse,
  DashboardStats,
  CreateWordRequest,
  UpdateWordRequest,
  CreateRoomRequest,
  UpdateRoomRequest,
  CreatePackRequest,
  UpdatePackRequest,
  GivePackRequest,
} from './types.full'

const API_BASE = '/api'

// 通用请求函数
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  return response.json()
}

// ======================
// 认证相关 API
// ======================

export const authApi = {
  register: (data: RegisterRequest) =>
    apiRequest<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    apiRequest<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<void>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => apiRequest<User>('/auth/me'),
}

// ======================
// 用户相关 API
// ======================

export const userApi = {
  getWords: (params?: { page?: number; limit?: number; search?: string; rarity?: string; favorited?: boolean }) =>
    apiRequest<PaginatedResponse<UserWord>>(`/users/words?${new URLSearchParams(params as any)}`),

  getPacks: () => apiRequest<UserPack[]>('/users/packs'),
  
  toggleFavorite: (userWordId: string, isFavorite: boolean) =>
    apiRequest(`/users/words/${userWordId}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite })
    })
}

// ======================
// 卡包相关 API
// ======================

export const packApi = {
  getAll: () => apiRequest<Pack[]>('/packs'),

  open: (packId: string) =>
    apiRequest<OpenPackResponse>('/packs/open', {
      method: 'POST',
      body: JSON.stringify({ packId }),
    }),
}

// ======================
// 聊天室相关 API
// ======================

export const roomApi = {
  getAll: () => apiRequest<ChatRoom[]>('/rooms'),

  getMessages: (roomId: string, params?: { limit?: number; before?: string }) =>
    apiRequest<Message[]>(`/rooms/${roomId}/messages?${new URLSearchParams(params as any)}`),

  sendMessage: (roomId: string, data: SendMessageRequest) =>
    apiRequest<Message>(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ======================
// 消息相关 API
// ======================

export const messageApi = {
  rose: (messageId: string) =>
    apiRequest<{ messageId: string; roses: number }>(`/messages/${messageId}/rose`, {
      method: 'POST',
    }),

  unrose: (messageId: string) =>
    apiRequest<{ messageId: string; roses: number }>(`/messages/${messageId}/rose`, {
      method: 'DELETE',
    }),
}

// ======================
// 单词书相关 API
// ======================

export const wordbookApi = {
  getAll: () => apiRequest<Wordbook[]>('/wordbooks'),
}

// ======================
// 管理员 API
// ======================

export const adminApi = {
  // 统计面板
  getDashboard: () => apiRequest<DashboardStats>('/admin/dashboard'),

  // 用户管理
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiRequest<PaginatedResponse<User>>(`/admin/users?${new URLSearchParams(params as any)}`),

  banUser: (userId: string, banned: boolean) =>
    apiRequest<{ userId: string; banned: boolean }>(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ banned }),
    }),

  givePack: (userId: string, data: GivePackRequest) =>
    apiRequest<any>(`/admin/users/${userId}/packs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 单词管理
  getWords: (params?: { page?: number; limit?: number; search?: string; rarity?: string }) =>
    apiRequest<PaginatedResponse<Word & { wordbookIds: string[] }>>(`/admin/words?${new URLSearchParams(params as any)}`),

  createWord: (data: CreateWordRequest) =>
    apiRequest<{ id: string; word: string }>('/admin/words', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWord: (wordId: string, data: UpdateWordRequest) =>
    apiRequest<{ id: string }>(`/admin/words/${wordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteWord: (wordId: string) =>
    apiRequest<{ id: string }>(`/admin/words/${wordId}`, {
      method: 'DELETE',
    }),

  // 聊天室管理
  getRooms: () => apiRequest<ChatRoom[]>('/admin/rooms'),

  createRoom: (data: CreateRoomRequest) =>
    apiRequest<{ id: string; name: string }>('/admin/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRoom: (roomId: string, data: UpdateRoomRequest) =>
    apiRequest<{ id: string }>(`/admin/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRoom: (roomId: string) =>
    apiRequest<{ id: string }>(`/admin/rooms/${roomId}`, {
      method: 'DELETE',
    }),

  // 卡包管理
  getPacks: () => apiRequest<Pack[]>('/admin/packs'),

  createPack: (data: CreatePackRequest) =>
    apiRequest<{ id: string; name: string }>('/admin/packs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePack: (packId: string, data: UpdatePackRequest) =>
    apiRequest<{ id: string }>(`/admin/packs/${packId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePack: (packId: string) =>
    apiRequest<{ id: string }>(`/admin/packs/${packId}`, {
      method: 'DELETE',
    }),
}
