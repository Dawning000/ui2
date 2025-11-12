import { http } from './http'

export interface UploadResponse {
  code: number
  message: string
  data: {
    url: string
  }
}

/**
 * 上传头像
 * @param file 图片文件
 * @returns 上传后的图片URL
 */
export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await http<UploadResponse>('/upload/avatar', {
    method: 'POST',
    body: formData
  })
  
  if (res.code === 200 && res.data?.url) {
    return res.data.url
  }
  throw new Error(res.message || '上传失败')
}

/**
 * 上传图片
 * @param file 图片文件
 * @returns 上传后的图片URL
 */
/**
 * 上传图片文件到服务器
 * @param file 要上传的文件对象
 * @returns 上传成功后的图片URL
 * @throws 上传失败时抛出错误
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('strategy_id', '2') // 确保是字符串类型
    
    // 添加请求超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
    
    const res = await fetch('https://pic.billadom.top/api/v1/upload', {
      // 移除手动设置的Content-Type，让浏览器自动生成带有boundary的Content-Type
      method: 'POST',
      body: formData,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // 检查HTTP状态
    if (!res.ok) {
      throw new Error(`HTTP错误！状态码: ${res.status}, ${res.statusText}`)
    }
    
    // 解析JSON响应
    const data = await res.json()
    
    // 检查业务逻辑状态
    if (data.code === 200 && data.data?.url) {
      return data.data.url
    } else {
      throw new Error(data.message || '上传失败：服务器返回错误')
    }
  } catch (error) {
    // 处理各种错误类型
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('上传超时，请重试')
    }
    throw new Error(error instanceof Error ? error.message : '上传失败，请检查网络连接后重试')
  }
}

/**
 * 上传图片文件（兼容UserSettings.vue中的调用）
 * @param file 要上传的文件对象
 * @param strategyId 存储策略ID
 * @returns 包含data字段的对象，data字段为上传后的图片URL
 * @throws 上传失败时抛出错误
 */
export async function updatePhoto(file: File, strategyId: number): Promise<{data: string}> {
  try {
    // 调用uploadImage函数进行上传
    const url = await uploadImage(file)
    
    // 返回符合UserSettings.vue期望的格式
    return { data: url }
  } catch (error) {
    console.error('更新照片失败:', error)
    throw error
  }
}

