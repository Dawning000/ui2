import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, ApiResponse, ProfileUpdateData } from '@/types/user'
import { http, jsonBody } from '@/api/http'
import { userApi } from '../api/users'

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
  const isAdmin = computed(() => {
    if (!user.value) return false
    // 检查用户名是否为admin（针对可能没有返回role的情况）
    if (user.value.username === "admin") return true
    if (!user.value?.role) return false
    const role = user.value.role.toLowerCase()
    // 支持多种可能的管理员角色名称
    return role.includes("admin") || role === "administrator" || role === "role_admin"
  })

  // 动作
  const resetUserState = (options?: { preserveCredentials?: boolean }) => {
    user.value = null
    userId.value = null

    try {
      if (!options?.preserveCredentials) {
        clearCredentials()
      }
      localStorage.removeItem('autoLogin')
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('current_user_id')
      sessionStorage.removeItem('user_token')
      sessionStorage.removeItem('user_info')
      sessionStorage.removeItem('current_user_id')
    } catch (error) {
      console.error('清除本地存储失败:', error)
    }
  }

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
        // 登录成功后获取完整用户信息（包含角色）
        const userInfoResponse = await http<any>(`/user/${res.data.id}/info`)
        if (userInfoResponse && userInfoResponse.code === 200 && userInfoResponse.data) {
          user.value = userInfoResponse.data as unknown as User
          // 保存用户id和完整用户信息
          try {
            if (credentials.remember) {
              localStorage.setItem('current_user_id', userInfoResponse.data.id.toString())
              localStorage.setItem('user_info', JSON.stringify(userInfoResponse.data))
            } else {
              // 未勾选"记住我"，使用 sessionStorage 保存用户信息
              sessionStorage.setItem('current_user_id', userInfoResponse.data.id.toString())
              sessionStorage.setItem('user_info', JSON.stringify(userInfoResponse.data))
            }
          } catch (error) {
            console.error('保存用户数据失败:', error)
          }
        } else {
          //  fallback: 使用登录响应数据
          user.value = res.data as unknown as User
          try {
            if (credentials.remember) {
              localStorage.setItem('current_user_id', res.data.id.toString())
              localStorage.setItem('user_info', JSON.stringify(res.data))
            } else {
              // 未勾选"记住我"，使用 sessionStorage 保存用户信息
              sessionStorage.setItem('current_user_id', res.data.id.toString())
              sessionStorage.setItem('user_info', JSON.stringify(res.data))
            }
          } catch (error) {
            console.error('保存用户数据失败:', error)
          }
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
    resetUserState()
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
    // 首先尝试从本地存储加载完整用户信息
    try {
      const storedUserInfo = localStorage.getItem('user_info')
      if (storedUserInfo) {
        const loadedUser = JSON.parse(storedUserInfo) as User
        console.log('从本地存储加载的用户信息:', loadedUser)
        user.value = loadedUser
        userId.value = user.value.id
      }
    } catch (error) {
      console.error('从本地存储加载用户信息失败:', error)
      // 如果本地存储加载失败，尝试从会话存储加载
    }
    // 如果本地存储没有，尝试从会话存储加载
    if (!user.value) {
      try {
        const sessionUserInfo = sessionStorage.getItem('user_info')
        if (sessionUserInfo) {
          const loadedUser = JSON.parse(sessionUserInfo) as User
          console.log('从会话存储加载的用户信息:', loadedUser)
          user.value = loadedUser
          userId.value = user.value.id
        }
      } catch (error) {
        console.error('从会话存储加载用户信息失败:', error)
        // 如果会话存储加载失败，不要清理数据
      }
    }

    // 调用/user/me接口获取最新用户信息（单独的try/catch，避免网络问题导致本地数据被清除）
    try {
      console.log('从后端获取最新用户信息...')
      const response = await userApi.getCurrentUser()
      console.log('从后端获取的用户信息:', response.data)
      if (response && response.code === 200 && response.data) {
        user.value = response.data as unknown as User
        userId.value = user.value.id
        // 更新本地存储
        localStorage.setItem('user_info', JSON.stringify(response.data))
        localStorage.setItem('current_user_id', response.data.id.toString())
        console.log('本地存储已更新为最新用户信息:', response.data)
      }
    } catch (error) {
      console.error('从后端获取最新用户信息失败:', error)
      const errorCode = (error as { code?: number } | undefined)?.code
      if (errorCode === 10005) {
        console.warn('检测到未授权响应，切换到未登录状态')
        resetUserState({ preserveCredentials: true })
        return
      }
      // 如果网络请求失败，保持本地存储的用户信息
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
    isAdmin,
    login,
    register,
    logout,
    loadUserFromStorage,
    updateProfile,
    autoLogin,
    getSavedCredentials
  }
})
