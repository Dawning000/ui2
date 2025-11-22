<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-form">
        <div class="form-header">
          <h1>加入我们</h1>
          <p>创建账号，开始你的影视讨论之旅</p>
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="form-row">
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                type="text" 
                id="username"
                v-model="form.username"
                placeholder="请输入用户名"
                required
                class="form-input"
                :class="{ error: errors.username }"
              >
              <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
            </div>
            
            <div class="form-group">
              <label for="nickname">昵称</label>
              <input 
                type="text" 
                id="nickname"
                v-model="form.nickname"
                placeholder="请输入昵称"
                class="form-input"
                :class="{ error: errors.nickname }"
              >
              <span v-if="errors.nickname" class="error-message">{{ errors.nickname }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">邮箱</label>
            <input 
              type="email" 
              id="email"
              v-model="form.email"
              placeholder="请输入邮箱地址"
              required
              class="form-input"
              :class="{ error: errors.email }"
            >
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password">密码</label>
              <div class="password-input">
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  placeholder="请输入密码"
                  required
                  class="form-input"
                  :class="{ error: errors.password }"
                >
                <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'icon-eye-off' : 'icon-eye'"></i>
                </button>
              </div>
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">确认密码</label>
              <div class="password-input">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  placeholder="请再次输入密码"
                  required
                  class="form-input"
                  :class="{ error: errors.confirmPassword }"
                >
                <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                  <i :class="showConfirmPassword ? 'icon-eye-off' : 'icon-eye'"></i>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="interests">感兴趣的影视类型</label>
            <div class="interests-grid">
              <label v-for="interest in interestOptions" :key="interest.value" class="interest-item">
                <input 
                  type="checkbox" 
                  :value="interest.value"
                  v-model="form.interests"
                >
                <span class="interest-label">{{ interest.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreeTerms" required>
              <span class="checkmark"></span>
              我同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#" class="terms-link">隐私政策</a>
            </label>
          </div>
          
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.newsletter">
              <span class="checkmark"></span>
              订阅我们的影视资讯邮件
            </label>
          </div>
          
          <button type="submit" class="submit-btn" :disabled="loading">
            <div v-if="loading" class="loading-spinner"></div>
            {{ loading ? '注册中...' : '创建账号' }}
          </button>
        </form>
        
        <div class="form-footer">
          <p>已有账号？ <router-link to="/login" class="link">立即登录</router-link></p>
        </div>
        
        <div class="divider">
          <span>或者</span>
        </div>
        
        <div class="social-login">
          <button class="social-btn wechat">
            <i class="icon-wechat"></i>
            微信注册
          </button>
          <button class="social-btn qq" @click="handleQQLogin">
            <i class="icon-qq"></i>
            QQ注册
          </button>
        </div>
      </div>
      
      <div class="register-image">
        <div class="image-content">
          <h2>开启你的观影之旅</h2>
          <p>加入我们的社区，与志同道合的影迷一起分享精彩内容，发现更多好电影好剧集</p>
          <div class="benefits">
            <div class="benefit-item">
              <i class="icon-star"></i>
              <div>
                <h4>个性化推荐</h4>
                <p>根据你的喜好推荐优质内容</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="icon-users"></i>
              <div>
                <h4>社区互动</h4>
                <p>与千万影迷交流观影心得</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="icon-trophy"></i>
              <div>
                <h4>成就系统</h4>
                <p>参与讨论获得专属徽章</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { API_BASE } from '../api/http'
import { notificationService as notify } from '@/utils/notification'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = ref({})

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  interests: [],
  agreeTerms: false,
  newsletter: false
})

const interestOptions = [
  { value: 'movie', label: '电影' },
  { value: 'tv', label: '电视剧' },
  { value: 'anime', label: '动漫' },
  { value: 'variety', label: '综艺' },
  { value: 'documentary', label: '纪录片' },
  { value: 'comedy', label: '喜剧' },
  { value: 'action', label: '动作片' },
  { value: 'romance', label: '爱情片' },
  { value: 'horror', label: '恐怖片' },
  { value: 'sci-fi', label: '科幻片' }
]

// 方法
const validateForm = () => {
  errors.value = {}
  
  if (!form.username.trim()) {
    errors.value.username = '请输入用户名'
  } else if (form.username.length < 3) {
    errors.value.username = '用户名长度至少3位'
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(form.username)) {
    errors.value.username = '用户名只能包含字母、数字、下划线和中文'
  }
  
  if (form.nickname && form.nickname.length > 20) {
    errors.value.nickname = '昵称长度不能超过20位'
  }
  
  if (!form.email.trim()) {
    errors.value.email = '请输入邮箱地址'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = '请输入有效的邮箱地址'
  }
  
  if (!form.password) {
    errors.value.password = '请输入密码'
  } else if (form.password.length < 6) {
    errors.value.password = '密码长度至少6位'
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
    errors.value.password = '密码必须包含字母和数字'
  }
  
  if (!form.confirmPassword) {
    errors.value.confirmPassword = '请确认密码'
  } else if (form.password !== form.confirmPassword) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  }
  
  if (!form.agreeTerms) {
    errors.value.agreeTerms = '请同意服务条款和隐私政策'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const result = await userStore.register({
      username: form.username,
      nickname: form.nickname || form.username,
      email: form.email,
      password: form.password,
      favors: form.interests
    })
    
    if (result.success) {
      // 注册成功，跳转到登录页
      router.push('/login')
    } else {
      const message = result.message || '注册失败，请稍后重试'
      errors.value.general = message
      notify.error(message)
    }
  } catch (error) {
    const message = '注册失败，请稍后重试'
    errors.value.general = message
    notify.error(message)
  } finally {
    loading.value = false
  }
}

// QQ登录
const handleQQLogin = () => {
  window.location.href = `${API_BASE}/oauth2/qq`
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary-color) 40%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  // 暗色模式下的背景
  :root.dark & {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 40%, #1f1f1f 100%);
  }
}

.register-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 700px;
  
  // 暗色模式下的容器样式
  :root.dark & {
    background: var(--bg-card);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }
}

.register-form {
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 10px;
    
    // 暗色模式下的标题颜色
    :root.dark & {
      color: var(--text-primary);
    }
  }
  
  p {
    color: #6b7280;
    font-size: 1rem;
    
    // 暗色模式下的副标题颜色
    :root.dark & {
      color: var(--text-secondary);
    }
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 25px;
  
  label {
    display: block;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
    font-size: 14px;
    
    // 暗色模式下的标签颜色
    :root.dark & {
      color: var(--text-secondary);
    }
  }
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background: white;
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--shadow-color);
  }
  
  &.error {
    border-color: #ef4444;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
  
  // 暗色模式下的输入框样式
  :root.dark & {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
    
    &::placeholder {
      color: var(--text-light);
    }
  }
}

.password-input {
  position: relative;
  
  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      color: #6b7280;
    }
    
    // 暗色模式下的眼睛图标颜色
    :root.dark & {
      color: var(--text-light);
      
      &:hover {
        color: var(--text-secondary);
      }
    }
  }
  
  // 暗色模式下增强密码点可见性
  :root.dark & input[type="password"] {
    letter-spacing: 2px;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
    
    // 使用更明显的密码点
    -webkit-text-security: disc;
    text-security: disc;
    
    // 确保密码点在暗色背景下清晰可见
    &::placeholder {
      color: var(--text-light);
      opacity: 0.6;
    }
  }
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.interest-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--secondary-dark);
  }
  
  // 暗色模式下的兴趣项样式
  :root.dark & {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    
    &:hover {
      border-color: var(--text-light);
    }
    
    &:has(input:checked) {
      border-color: var(--primary-color);
      background: rgba(251, 146, 60, 0.15);
    }
  }
  
  input[type="checkbox"] {
    display: none;
  }
  
  input[type="checkbox"]:checked + .interest-label {
    color: var(--primary-color);
    font-weight: 500;
  }
  
  input[type="checkbox"]:checked ~ .interest-label {
    color: var(--primary-color);
    font-weight: 500;
  }
  
  &:has(input:checked) {
    border-color: var(--primary-color);
    background: #fff7ed;
  }
}

.interest-label {
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
  
  // 暗色模式下的标签颜色
  :root.dark & {
    color: var(--text-secondary);
  }
}

.form-options {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  
  // 暗色模式下的文字颜色
  :root.dark & {
    color: var(--text-secondary);
  }
  
  input[type="checkbox"] {
    display: none;
  }
  
  .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--secondary-light);
    border-radius: 4px;
    margin-right: 8px;
    margin-top: 2px;
    position: relative;
    transition: all 0.2s;
    flex-shrink: 0;
    
    // 暗色模式下的复选框边框
    :root.dark & {
      border-color: var(--border-color);
    }
    
    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s;
    }
  }
  
  input[type="checkbox"]:checked + .checkmark {
    background: var(--primary-color);
    border-color: var(--primary-color);
    
    &::after {
      opacity: 1;
    }
  }
  
  .terms-link {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      color: var(--primary-dark);
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  
  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-footer {
  text-align: center;
  margin-bottom: 30px;
  
  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
    
    // 暗色模式下的文字颜色
    :root.dark & {
      color: var(--text-secondary);
    }
  }
  
  .link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      color: #2563eb;
    }
    
    // 暗色模式下的链接颜色
    :root.dark & {
      color: var(--primary-light);
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.divider {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--secondary-light);
    
    // 暗色模式下的分割线颜色
    :root.dark & {
      background: var(--border-color);
    }
  }
  
  span {
    background: white;
    padding: 0 20px;
    color: #9ca3af;
    font-size: 14px;
    
    // 暗色模式下的文字和背景
    :root.dark & {
      background: var(--bg-card);
      color: var(--text-light);
    }
  }
}

.social-login {
  display: flex;
  gap: 15px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    border-color: var(--secondary-dark);
    transform: translateY(-1px);
  }
  
  // 暗色模式下的社交按钮样式
  :root.dark & {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    
    &:hover {
      border-color: var(--text-light);
      background: var(--bg-primary);
    }
  }
  
  &.wechat {
    color: #1aad19;
    
    &:hover {
      border-color: #1aad19;
      background: #f0f9f0;
    }
    
    // 暗色模式下的微信按钮
    :root.dark & {
      &:hover {
        background: rgba(26, 173, 25, 0.1);
        border-color: #1aad19;
      }
    }
  }
  
  &.qq {
    color: #12b7f5;
    
    &:hover {
      border-color: #12b7f5;
      background: #f0f9ff;
    }
    
    // 暗色模式下的QQ按钮
    :root.dark & {
      &:hover {
        background: rgba(18, 183, 245, 0.1);
        border-color: #12b7f5;
      }
    }
  }
}

.register-image {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  color: white;
  padding: 50px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  // 暗色模式下的右侧区域背景
  :root.dark & {
    background: linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 50%, #2d2d2d 100%);
    border-left: 1px solid var(--border-color);
  }
}

.image-content {
  text-align: center;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 40px;
    opacity: 0.9;
    line-height: 1.6;
  }
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  text-align: left;
  
  i {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 5px;
  }
  
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .register-container {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  
  .register-image {
    display: none;
  }
  
  .register-form {
    padding: 40px 30px;
    max-height: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-header h1 {
    font-size: 1.75rem;
  }
  
  .interests-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .social-login {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 10px;
  }
  
  .register-form {
    padding: 30px 20px;
  }
  
  .form-header h1 {
    font-size: 1.5rem;
  }
  
  .interests-grid {
    grid-template-columns: 1fr;
  }
}
</style>
