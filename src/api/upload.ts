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
  
  const res = await http<UploadResponse>('/picture/upload', {
    method: 'POST',
    body: formData
  })
  
  if (res.code === 200 && res.data?.url) {
    return res.data.url
  }
  throw new Error(res.message || '上传失败')
}

/**
 * 上传图片文件
 * @param file 图片文件
 * @returns 上传后的图片URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await http<UploadResponse>('/picture/upload', {
    method: 'POST',
    body: formData
  })
  
  if (res.code === 200 && res.data?.url) {
    return res.data.url
  }
  throw new Error(res.message || '上传失败')
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

