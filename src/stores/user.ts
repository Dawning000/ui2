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
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)
      if (credentials.remember) formData.append('remember-me', '1')

      const res = await http<any>('/user/login', {
        method: 'POST',
        body: formData
      })
      // 兼容后端返回: { code: 200, data: {...}, message: 'success' }
      if ((res && (res.code === 200 || res.code === '200')) && res.data) {
        user.value = res.data as unknown as User
        return { success: true }
      }
      return { success: false, message: (res && res.message) || '登录失败' }
    } catch (error) {
      return { success: false, message: '登录失败，请稍后重试' }
    }
  }

  const register = async (userData: RegisterData): Promise<ApiResponse> => {
    try {
      // 注册接口: /api/user/register，字段：username, nickname, password, email, favors(string[])
      const res = await http<any>('/user/register', {
        method: 'POST',
        body: jsonBody({
          username: userData.username,
          nickname: userData.nickname,
          password: userData.password,
          email: userData.email,
          favors: userData.favors
        })
      })
      if ((res && (res.code === 200 || res.code === '200'))) {
        return { success: true }
      }
      return { success: false, message: (res && res.message) || '注册失败' }
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
