<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <div class="router-view-wrapper">
        <router-view />
      </div>
    </main>
    <Footer />
    <!-- 全局通知组件 -->
    <Notification />
    <ConfirmDialog 
      :visible="confirmConfig.visible"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :confirm-text="confirmConfig.confirmText"
      :cancel-text="confirmConfig.cancelText"
      :type="confirmConfig.type"
      :is-processing="confirmConfig.isProcessing"
      @confirm="confirmService.handleConfirm"
      @cancel="confirmService.handleCancel"
      @close="confirmService.close"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import Notification from './components/Notification.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { useUserStore } from './stores/user'
import { confirmService, confirmConfig } from './utils/confirm'

const userStore = useUserStore()

// 应用启动时尝试自动登录
onMounted(async () => {
  // 如果用户已登录，则无需自动登录
  if (userStore.isLoggedIn) {
    return
  }
  
  // 尝试使用保存的账号密码自动登录
  const autoLoginSuccess = await userStore.autoLogin()
  
  // 如果自动登录失败，尝试从后端恢复登录状态（通过 session cookie）
  if (!autoLoginSuccess) {
    await userStore.loadUserFromStorage()
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 70px; // 为固定导航栏留出空间
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.router-view-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
