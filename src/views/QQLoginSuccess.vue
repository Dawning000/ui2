<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// QQ登录成功后，获取URL中的用户信息并保存
onMounted(() => {
  try {
    // 解析URL中的用户信息
    const searchParams = new URLSearchParams(window.location.search)
    const userInfoStr = searchParams.get('userInfo') || ''
    const userInfo = JSON.parse(decodeURIComponent(userInfoStr))
    
    // 映射用户信息到User接口
    const mappedUser = {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      avatar: userInfo.avatar,
      nickname: userInfo.nickname,
      level: userInfo.level,
      joinDate: userInfo.join_date,
      followersCount: userInfo.followers_count,
      followingCount: userInfo.following_count,
      postsCount: 0,
      role: userInfo.role || 'USER'
    }
    
    // 保存用户信息到store
    userStore.user = mappedUser
    userStore.userId = mappedUser.id
    
    // 保存用户ID到localStorage
    localStorage.setItem('current_user_id', mappedUser.id.toString())
    
    // 跳转到主页
    router.push('/')
  } catch (error) {
    console.error('解析用户信息失败:', error)
    // 解析失败也跳转到主页
    router.push('/')
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