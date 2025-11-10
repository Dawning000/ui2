import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, ApiResponse, ProfileUpdateData } from '@/types/user'
import { http, jsonBody } from '@/api/http'

// localStorage 键名
const STORAGE_KEY_CREDENTIALS = 'remembered_credentials'

// 保存账号密码到 localStorage
function saveCredentials(username: string, password: string): void {
  try {
    const credentials = { username, password }
    localStorage.setItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials))
  } catch (error) {
    console.error('保存账号密码失败:', error)
  }
}

// 从 localStorage 读取账号密码
function loadCredentials(): { username: string; password: string } | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CREDENTIALS)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('读取账号密码失败:', error)
  }
  return null
}

// 清除保存的账号密码
function clearCredentials(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CREDENTIALS)
  } catch (error) {
    console.error('清除账号密码失败:', error)
  }
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const userId = ref<number | null>(null)

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
        // 保存用户id
        userId.value = res.data.id
        // 同时保存到本地存储，以便刷新页面后仍能使用
        try {
          localStorage.setItem('current_user_id', res.data.id.toString())
        } catch (error) {
          console.error('保存用户id失败:', error)
        }
        
        // 如果勾选了"记住我"且登录成功，保存账号密码
        if (credentials.remember) {
          saveCredentials(credentials.username, credentials.password)
        } else {
          // 如果没有勾选"记住我"，清除之前保存的账号密码
          clearCredentials()
        }
        
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
    try { await http('/user/logout', { method: 'POST' }) } catch {}
    user.value = null
    userId.value = null
    
    // 完全清空浏览器本地存储中的所有登录相关数据
    try {
      // 清除特定的用户相关存储项
      localStorage.removeItem('remembered_credentials')
      localStorage.removeItem('autoLogin')
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('current_user_id')
      
      // 清除会话存储中的用户相关项
      sessionStorage.removeItem('user_token')
      sessionStorage.removeItem('user_info')
      
      // 清除任何可能存储在localStorage中的用户认证相关数据
      // 这里可以根据需要添加更多特定的键名
    } catch (error) {
      console.error('清除本地存储失败:', error)
    }
  }

  // 自动登录：使用保存的账号密码进行登录
  const autoLogin = async (): Promise<boolean> => {
    const credentials = loadCredentials()
    if (!credentials || !credentials.username || !credentials.password) {
      return false
    }
    
    try {
      const result = await login({
        username: credentials.username,
        password: credentials.password,
        remember: true // 自动登录时也保持"记住我"状态
      })
      return result.success
    } catch (error) {
      return false
    }
  }

  // 获取保存的账号密码（用于填充登录表单）
  const getSavedCredentials = (): { username: string; password: string } | null => {
    return loadCredentials()
  }

  const loadUserFromStorage = async (): Promise<void> => {
    try {
      // 首先尝试从本地存储获取用户id
      const storedUserId = localStorage.getItem('current_user_id')
      if (storedUserId) {
        userId.value = parseInt(storedUserId)
        
        // 使用用户id获取用户信息，不再使用/user/me接口
        const response = await http<any>(`/user/${userId.value}/info`)
        if (response && response.code === 200 && response.data) {
          user.value = response.data as unknown as User
        } else {
          user.value = null
          userId.value = null
          localStorage.removeItem('current_user_id')
        }
      } else {
        user.value = null
      }
    } catch {
      user.value = null
      userId.value = null
    }
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
    userId,
    isLoggedIn,
    login,
    register,
    logout,
    loadUserFromStorage,
    updateProfile,
    autoLogin,
    getSavedCredentials
  }
})
