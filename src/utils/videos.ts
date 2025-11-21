/**
 * 获取视频列表
 * 从 public/videos 文件夹中获取所有视频文件
 */
export interface VideoInfo {
  name: string
  displayName: string
  url: string
  thumbnail?: string
  duration?: number
}

// 支持的视频格式
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']

/**
 * 获取视频文件列表
 * 从 public/videos/videos.json 配置文件加载视频列表
 */
export async function getVideoList(): Promise<VideoInfo[]> {
  try {
    // 尝试加载视频列表配置文件
    const response = await fetch('/videos/videos.json')
    if (response.ok) {
      const videoList = await response.json()
      return videoList.map((video: any) => ({
        name: video.name,
        displayName: video.displayName || generateDisplayName(video.name),
        url: `/videos/${video.name}`,
        thumbnail: video.thumbnail ? (video.thumbnail.startsWith('/') ? video.thumbnail : `/videos/${video.thumbnail}`) : undefined
      }))
    } else {
      console.warn('视频列表配置文件不存在或无法访问')
      return []
    }
  } catch (error) {
    console.warn('无法加载视频列表配置文件:', error)
    return []
  }
}

/**
 * 检查文件是否为视频文件
 */
export function isVideoFile(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return VIDEO_EXTENSIONS.includes(ext)
}

/**
 * 从文件名生成显示名称
 */
export function generateDisplayName(filename: string): string {
  // 移除扩展名
  let name = filename.replace(/\.[^/.]+$/, '')
  // 替换下划线和连字符为空格
  name = name.replace(/[_-]/g, ' ')
  // 首字母大写
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

