<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/users'
import type { User } from '../types/user'

const router = useRouter()
const userStore = useUserStore()

// QQ登录成功后，从/user/me获取用户信息并保存
onMounted(async () => {
  try {
    // 调用API获取当前登录用户信息
    const response = await userApi.getCurrentUser()
    console.log('QQLoginSuccess - 用户信息响应:', response)
    if (response && String(response.code) === '200' && response.data) {
      const userInfo = response.data
      
      // 映射用户信息到User接口
      const mappedUser: Partial<User> = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        avatar: userInfo.avatar,
        nickname: userInfo.nickname,
        level: userInfo.level,
        joinDate: userInfo.join_date,
        followersCount: userInfo.followers_count,
        followingCount: userInfo.following_count,
        postsCount: userInfo.posts_count,
        role: userInfo.role || 'USER'
      }
      
      // 保存用户信息到store
      userStore.user = mappedUser as unknown as User
      userStore.userId = mappedUser.id as number
      
      // 保存用户信息到localStorage
      localStorage.setItem('current_user_id', mappedUser.id?.toString() || '')
      localStorage.setItem('user_info', JSON.stringify(mappedUser))
      
      // 调试信息
      console.log('QQLoginSuccess - 用户信息保存到store:', userStore.user)
      console.log('QQLoginSuccess - 用户信息保存到localStorage:', localStorage.getItem('user_info'))
      console.log('QQLoginSuccess - 用户是否登录:', userStore.isLoggedIn)
      
      // 跳转到主页
      setTimeout(() => {
        console.log('QQLoginSuccess - 跳转到主页')
        router.push('/')
      }, 1000)
    } else {
      console.error('获取用户信息失败:', response?.message)
      
      router.push('/')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    
    // router.push('/')
  }
})
</script>

<template>
  <div class="qq-login-success">
    <h2>QQ登录成功</h2>
    <p>正在跳转到主页...</p>
  </div>
</template>

<style scoped>
.qq-login-success {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  background: linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary-color) 40%, var(--primary-light) 100%);
  color: white;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>