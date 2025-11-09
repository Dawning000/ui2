import { createApp } from 'vue'
import { createPinia } from 'pinia'
import type { App as VueApp } from 'vue'
import router from './router'
import App from './App.vue'
import './style/main.scss'
// 导入通知组件
import Notification from './components/Notification.vue'
// 导入通知服务并挂载到全局属性
import notificationService from './utils/notification'

const app: VueApp = createApp(App)
const pinia = createPinia()

// 全局注册通知组件
app.component('Notification', Notification)
// 挂载通知服务到全局属性
app.config.globalProperties.$notification = notificationService

app.use(pinia)
app.use(router)

app.mount('#app')
