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
    <GlobalMusic />
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
import GlobalMusic from './components/GlobalMusic.vue'
import { useUserStore } from './stores/user'
import { confirmService, confirmConfig } from './utils/confirm'

const userStore = useUserStore()

// 应用启动时尝试自动登录
onMounted(async () => {
  // 进入主页时先同步最新登录状态（会调用 /user/me）
  await userStore.loadUserFromStorage()
  if (userStore.isLoggedIn) return

  // 如果还未登录，再尝试自动登录
  const autoLoginSuccess = await userStore.autoLogin()
  
  // 自动登录失败则保持未登录状态
  if (!autoLoginSuccess) {
    console.log('自动登录失败，保持未登录状态')
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
