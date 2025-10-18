import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, ApiResponse, ProfileUpdateData } from '@/types/user'
import { http, jsonBody } from '@/api/http'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)

  // 动作
  const login = async (credentials: LoginCredentials): Promise<ApiResponse> => {
    try {
      const res = await http<ApiResponse<User>>('/auth/login', {
        method: 'POST',
        body: jsonBody(credentials)
      })
      if (res.success && res.user) {
        user.value = res.user as unknown as User
        return { success: true }
      }
      return { success: false, message: res.message || '登录失败' }
    } catch (error) {
      return { success: false, message: '登录失败，请稍后重试' }
    }
  }

  const register = async (userData: RegisterData): Promise<ApiResponse> => {
    try {
      const res = await http<ApiResponse<User>>('/auth/register', {
        method: 'POST',
        body: jsonBody(userData)
      })
      if (res.success && res.user) {
        user.value = res.user as unknown as User
        return { success: true }
      }
      return { success: false, message: res.message || '注册失败' }
    } catch (error) {
      return { success: false, message: '注册失败，请稍后重试' }
    }
  }

  const logout = async (): Promise<void> => {
    try { await http('/auth/logout', { method: 'POST' }) } catch {}
    user.value = null
  }

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      const res = await http<ApiResponse<User>>('/auth/me')
      if (res.success && res.user) {
        user.value = res.user as unknown as User
      } else {
        user.value = null
      }
    } catch { user.value = null }
  }

  const updateProfile = async (profileData: ProfileUpdateData): Promise<ApiResponse> => {
    try {
      const res = await http<ApiResponse<User>>('/user/profile', {
        method: 'PATCH',
        body: jsonBody(profileData)
      })
      if (res.success && res.user) {
        user.value = { ...(user.value as User), ...(res.user as unknown as User) }
        return { success: true }
      }
      return { success: false, message: res.message || '更新失败' }
    } catch (error) {
      return { success: false, message: '更新失败，请稍后重试' }
    }
  }

  // 兼容：移除本地 token 存储的遗留

  return {
    user,
    isLoggedIn,
    login,
    register,
    logout,
    loadUserFromStorage,
    updateProfile
  }
})
