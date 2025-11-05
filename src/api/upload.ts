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
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const res = await http<UploadResponse>('/upload/image', {
    method: 'POST',
    body: formData
  })
  
  if (res.code === 200 && res.data?.url) {
    return res.data.url
  }
  throw new Error(res.message || '上传失败')
}

