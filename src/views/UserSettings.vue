<template>
  <div class="user-settings">
    <div class="settings-header">
      <h1>账号设置</h1>
      <p>管理您的账户信息和安全设置</p>
    </div>
    
    <div class="settings-container">
      <!-- 设置导航标签 -->
      <div class="settings-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="['iconfont', tab.icon]"></i>
          <span>{{ tab.label }}</span>
        </div>
      </div>
      
      <!-- 设置内容区域 -->
      <div class="settings-content">
        <!-- 个人资料设置 -->
        <div v-if="activeTab === 'profile'" class="profile-settings">
          <h2>个人资料</h2>
          <div class="profile-form-container">
            <div v-loading="loading" class="profile-form-wrapper">
              <div class="form-group avatar-group">
                <div class="avatar-label">头像</div>
                <div class="avatar-container">
                  <input
                    type="file"
                    ref="avatarFileInput"
                    accept="image/jpeg,image/png,image/gif"
                    @change="handleAvatarFileSelect"
                    class="avatar-file-input"
                    style="display: none;"
                  >
                  <img 
                    :src="user?.avatar || '/avatar.png'" 
                    :alt="user?.nickname || 'User Avatar'"
                    class="user-avatar"
                    referrerpolicy="no-referrer"
                    @click="triggerAvatarFileSelect"
                  >
                  <div class="avatar-upload-hint" @click="triggerAvatarFileSelect">点击修改头像</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <div class="form-label">昵称</div>
                  <input 
                    type="text" 
                    v-model="editForm.nickname" 
                    placeholder="请输入昵称" 
                    class="form-input"
                    maxlength="20"
                  >
                </div>
              </div>


              
              <div class="form-row">
                <div class="form-group full-width">
                  <div class="form-label">电子邮箱</div>
                  <input 
                    type="email" 
                    v-model="editForm.email" 
                    placeholder="请输入电子邮箱" 
                    class="form-input"
                    maxlength="100"
                  >
                </div>
              </div>



              <div class="form-actions">
                <button 
                  @click="handleUpdateProfile" 
                  class="btn btn-primary"
                  :disabled="!editForm.nickname.trim() || updating"
                >
                  <span v-if="updating">更新中...</span>
                  <span v-else>保存修改</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 头像上传模态框 -->
        <div v-if="showAvatarModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title">修改头像</div>
              <button class="close-btn" @click="closeAvatarModal">×</button>
            </div>
            <div class="modal-body">
              <div class="avatar-upload-section">
                <img 
                  :src="avatarUrl || '/avatar.png'" 
                  :alt="'上传的头像'" 
                  class="preview-avatar"
                  referrerpolicy="no-referrer"
                >
                <div class="uploader-container">
                  <ImageUploader 
                    v-model="avatarUrl" 
                    upload-type="avatar"
                  ></ImageUploader>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeAvatarModal">取消</button>
              <button 
                class="btn btn-primary" 
                @click="handleUpdateAvatar"
                :disabled="!avatarUrl || updating"
              >
                <span v-if="updating">更新中...</span>
                <span v-else>确认上传</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 密码设置 -->
        <div v-if="activeTab === 'password'" class="password-settings">
          <h2>修改密码</h2>
          <div class="password-form-container">
            <div class="profile-form-wrapper">
            <div class="form-group avatar-group">
              <div class="avatar-label">&nbsp;</div>
              <div class="avatar-placeholder"></div>
            </div>
            
            <div class="form-description">请输入您的旧密码和新密码来更新您的账户密码</div>
            
            <form @submit.prevent="handleChangePassword" class="password-form">
              <div class="form-group">
                <label for="oldPassword">旧密码</label>
                <div class="input-with-icon">
                  
                  <input
                    type="password"
                    id="oldPassword"
                    v-model="passwordForm.oldPassword"
                    placeholder="请输入您的旧密码"
                    class="form-input"
                    :class="{ error: passwordErrors.oldPassword }"
                    required
                  />
                </div>
                <span v-if="passwordErrors.oldPassword" class="error-message">{{ passwordErrors.oldPassword }}</span>
              </div>
              
              <div class="form-group">
                <label for="newPassword">新密码</label>
                <div class="input-with-icon">
                  
                  <input
                    type="password"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    placeholder="请输入新密码"
                    class="form-input"
                    :class="{ error: passwordErrors.newPassword }"
                    required
                  />
                </div>
                <span v-if="passwordErrors.newPassword" class="error-message">{{ passwordErrors.newPassword }}</span>
                <p class="password-hint">密码长度至少8位，包含字母和数字</p>
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">确认新密码</label>
                <div class="input-with-icon">
                  
                  <input
                    type="password"
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    placeholder="请再次输入新密码"
                    class="form-input"
                    :class="{ error: passwordErrors.confirmPassword }"
                    required
                  />
                </div>
                <span v-if="passwordErrors.confirmPassword" class="error-message">{{ passwordErrors.confirmPassword }}</span>
              </div>
              
              <!-- 添加占位行以使表单长度与个人资料表单一致 -->
              <div class="form-row">
                <div class="form-group full-width password-placeholder">
                  <div class="form-label">&nbsp;</div>
                  <div class="form-placeholder"></div>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width password-placeholder">
                  <div class="form-label">&nbsp;</div>
                  <div class="form-placeholder"></div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
                    <div v-if="passwordLoading" class="loading-spinner small"></div>
                    {{ passwordLoading ? '修改中...' : '修改密码' }}
                  </button>
              </div>
            </form></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'
import ImageUploader from '@/components/ImageUploader.vue'
import { http, jsonBody, updatePhoto } from '@/api/http'
import { userApi } from '@/api/users'
import notificationService from '@/utils/notification'
import { uploadAvatar } from '@/api/upload'

// 使用项目中的通知服务
const notify = notificationService

// 导航标签数据
const tabs = [
  { id: 'profile', label: '个人资料', icon: 'icon-user' },
  { id: 'password', label: '修改密码', icon: 'icon-lock' }
]

// 当前激活的标签
const activeTab = ref('profile')

// 用户数据相关
const userStore = useUserStore()
const user = ref<User | null>(null)
const loading = ref(true)
const updating = ref(false)

// 编辑个人资料表单
const editForm = reactive({
  nickname: '',
  avatar: '',
  email: ''
})

// 存储新上传的头像文件对象
const newAvatarFile = ref<File | null>(null)

// 头像上传相关
const showAvatarModal = ref(false)
const avatarUrl = ref('')
const avatarFileInput = ref<HTMLInputElement | null>(null)

/**
 * 加载用户资料
 */
const loadUserProfile = async () => {
  try {
    loading.value = true
    // 从用户store获取当前用户信息
    const currentUser = userStore.user
    if (currentUser) {
      user.value = { ...currentUser }
      // 初始化编辑表单数据
      editForm.nickname = user.value.nickname || ''
      editForm.avatar = user.value.avatar || ''
      editForm.email = user.value.email || ''
    }
  } catch (error) {
    console.error('加载用户资料失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 触发头像文件选择
 */
const triggerAvatarFileSelect = () => {
  avatarFileInput.value?.click()
}

/**
 * 处理头像文件选择
 */
const handleAvatarFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    notify.error('请选择图片文件')
    return
  }

  // 验证文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    notify.error('图片大小不能超过10MB')
    return
  }

  // 存储文件对象，在保存时上传
  newAvatarFile.value = file
  
  // 创建预览URL
  const previewUrl = URL.createObjectURL(file)
  if (user.value) {
    user.value.avatar = previewUrl
  }
  
  // 清空input，允许重复选择同一文件
  if (target) {
    target.value = ''
  }
}

/**
 * 关闭头像上传模态框
 */
const closeAvatarModal = () => {
  showAvatarModal.value = false
  avatarUrl.value = user.value?.avatar || ''
}

/**
 * 更新用户资料
 */
const handleUpdateProfile = async () => {
  updating.value = true
  try {
    let avatarUrl = editForm.avatar || (user.value && user.value.avatar) || ''
    
    // 如果用户上传了新的图片文件，先调用上传接口获取URL
    if (newAvatarFile.value) {
      try {
        avatarUrl = await uploadAvatar(newAvatarFile.value)
        editForm.avatar = avatarUrl
        // 上传成功后清空文件对象
        newAvatarFile.value = null
      } catch (error: any) {
        console.error('上传头像失败:', error)
        notify.error(error.message || '上传头像失败，请稍后重试')
        return
      }
    }
    
    // 构建更新数据，仅包含后端要求的字段，空值字段不添加
    const updateData: any = {
      nickname: editForm.nickname,
      email: editForm.email
    }
    
    // 只有当avatar有值时才添加该字段
    if (avatarUrl) {
      updateData.avatar = avatarUrl
    }
    
    // 检查用户数据是否存在
    if (!user.value || !user.value.id) {
      console.error('用户数据不存在，无法更新个人资料')
      notify.error('用户数据不存在，请重新登录')
      return
    }
    
    // 调用更新用户信息的API
    const userId = user.value.id
    const response = await userApi.updateUserProfile(userId, updateData)
    
    if (response && response.code === 200) {
      // 更新本地用户信息
      if (user.value) {
        if (avatarUrl) {
          user.value.avatar = avatarUrl
        }
        user.value.nickname = editForm.nickname
        user.value.email = editForm.email
      }
      
        // 更新用户store
        if (user.value) {
          userStore.$patch({ user: { ...user.value } })
        }
      
      // 显示成功提示
      notify.success('个人资料更新成功！')
    } else {
      console.error('更新用户信息失败:', response?.message || '未知错误')
      notify.error('更新失败，请稍后重试')
    }
  } catch (error) {
    console.error('更新用户信息出错:', error)
    notify.error('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}

/**
 * 更新用户头像
 */
const handleUpdateAvatar = async () => {
  updating.value = true
  try {
    if (avatarUrl.value && user.value) {
      // avatarUrl.value 应该是已经上传后的URL字符串
      // 如果ImageUploader已经上传了文件，avatarUrl.value就是URL
      // 如果还没有上传，需要先上传
      let uploadedAvatarUrl = avatarUrl.value
      
      // 如果avatarUrl是blob URL（本地预览），说明还没有上传，需要先上传
      if (avatarUrl.value.startsWith('blob:')) {
        // 这种情况不应该发生，因为ImageUploader会自动上传
        // 但为了安全，我们检查一下
        notify.error('请先上传图片')
        return
      }
      
      // 构建更新数据
      const updateData = {
        nickname: user.value.nickname,
        avatar: uploadedAvatarUrl,
        email: user.value.email
      }
      
      // 调用更新用户信息的API
      const userId = user.value.id
      const response = await userApi.updateUserProfile(userId, updateData)
      
      if (response && response.code === 200) {
        // 更新本地用户信息
        user.value.avatar = uploadedAvatarUrl
        editForm.avatar = uploadedAvatarUrl
        
        // 更新用户store
        if (user.value) {
          userStore.$patch({ user: { ...user.value } })
        }
        
        // 显示成功提示
        notify.success('头像更新成功！')
        
        closeAvatarModal()
      } else {
        console.error('更新头像失败:', response?.message || '未知错误')
        notify.error('更新失败，请稍后重试')
      }
    }
  } catch (error) {
    console.error('更新头像出错:', error)
    notify.error('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}

// 组件挂载时加载用户资料
onMounted(() => {
  loadUserProfile()
})

// 修改密码相关数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordLoading = ref(false)

/**
 * 验证密码格式
 * @param {string} password - 要验证的密码
 * @returns {string} 错误信息，为空表示验证通过
 */
const validatePassword = (password: string): string => {
  // 至少8位，包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isLongEnough = password.length >= 8
  
  if (!hasLetter || !hasNumber || !isLongEnough) {
    return '密码长度至少8位，且必须包含字母和数字'
  }
  return ''
}

/**
 * 修改密码处理函数
 */
const handleChangePassword = async () => {
  // 重置错误提示
  passwordErrors.oldPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''
  
  // 验证旧密码
  if (!passwordForm.oldPassword) {
    passwordErrors.oldPassword = '请输入旧密码'
    return
  }
  
  // 验证新密码
  passwordErrors.newPassword = validatePassword(passwordForm.newPassword)
  if (passwordErrors.newPassword) {
    return
  }
  
  // 验证确认密码
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = '两次输入的密码不一致'
    return
  }
  
  // 提交修改
  try {
    passwordLoading.value = true
    
    // 构建请求数据
    const changePasswordData = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    }
    
    // 调用修改密码API，使用/user/{id}/password接口
    const userId = user.value?.id
    if (!userId) {
      throw new Error('用户信息不存在')
    }
    
    const response = await userApi.changePassword(userId, changePasswordData)
    
    if (response && response.code === 200) {
      // 显示成功提示
        notify.success('密码修改成功！')
      
      // 重置表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      // 显示错误信息
      console.error('修改密码失败:', response?.message || '未知错误')
        notify.error(response?.message || '密码修改失败，请稍后重试')
    }
  } catch (error) {
    console.error('修改密码出错:', error)
      notify.error('密码修改失败，请稍后重试')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
/* 基础样式 */
.user-settings {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 30px;
  text-align: center;
}

.settings-header h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 10px;
}

.settings-header p {
  color: #666;
  font-size: 1.1em;
}

.settings-container {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-tabs {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #606266;
}

.tab-item:hover {
  background: #e6f7ff;
}

.tab-item.active {
  background: #409eff;
  color: white;
}

.tab-item i {
  margin-right: 10px;
  font-size: 18px;
}

.settings-content {
  flex: 1;
  padding: 30px;
  width: 500px;
  height: 1000px;
}

.settings-content h2 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 1.5em;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.profile-form-container,
.password-form-container {
  max-width: 600px;
}

/* 个人资料表单样式 */
.profile-form-container {
  margin: 0 auto;
}

.profile-form-wrapper {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group.full-width {
  flex: 1 1 100%;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input:disabled {
  background: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-start;
  gap: 15px;
}

/* 头像上传样式 */
.avatar-group {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-label {
  display: block;
  margin-bottom: 15px;
  font-weight: 500;
  color: #333;
}

.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.avatar-upload-hint {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
  transition: color 0.2s ease;
}

.avatar-container:hover .avatar-upload-hint {
  color: #1890ff;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-primary:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
}

/* 头像上传模态框样式 */
.avatar-upload-section {
  text-align: center;
}

.preview-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
  border: 3px solid #f0f0f0;
}

.uploader-container {
  margin-top: 20px;
}

/* 修改密码表单样式 */
.password-form-container {
  max-width: 600px;
  margin: 0 auto;
}

/* 确保两个表单容器样式一致 */
.profile-form-container, .password-form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-description {
  color: #606266;
  margin-bottom: 20px;
  font-size: 14px;
}

.password-form .form-group {
  margin-bottom: 20px;
}

.password-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.password-form .form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.password-form .form-input:focus {
  outline: none;
  border-color: #409eff;
}

.password-form .form-input.error {
  border-color: #f56c6c;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 14px;
  height: 14px;
  border-width: 1.5px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
    padding: 10px;
  }
  
  .settings-tabs {
    width: 100%;
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    flex-direction: column;
  }
  
  .tab-item {
    flex-shrink: 0;
    width: 100%;
    margin-bottom: 5px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .modal-container {
    width: 95%;
  }
  
  .profile-form-wrapper,
  .password-form-container {
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>