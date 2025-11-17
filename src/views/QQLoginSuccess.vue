<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// QQ登录成功后，获取用户信息并跳转到主页
onMounted(() => {
  // 可以在这里添加获取用户信息的逻辑
  // 例如：userStore.getUserInfo()
  
  // 跳转到主页
  router.push('/')
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