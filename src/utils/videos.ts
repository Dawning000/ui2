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
  isSupported?: boolean // 浏览器是否支持直接播放
  format?: string // 视频格式
}

// 浏览器原生支持的视频格式
const BROWSER_SUPPORTED_FORMATS = ['.mp4', '.webm', '.ogg']

// 所有视频格式（包括不支持的）
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.flv']

/**
 * 检测浏览器是否支持该视频格式
 */
export function isBrowserSupportedFormat(url: string): boolean {
  const ext = url.toLowerCase().substring(url.lastIndexOf('.'))
  return BROWSER_SUPPORTED_FORMATS.includes(ext)
}

/**
 * 获取视频格式
 */
export function getVideoFormat(url: string): string {
  const ext = url.toLowerCase().substring(url.lastIndexOf('.'))
  return ext.replace('.', '').toUpperCase()
}

/**
 * 解析 CSV 文件内容
 */
function parseCSV(csvText: string): Array<{ filename: string; url: string }> {
  const lines = csvText.trim().split('\n')
  if (lines.length < 1) return []
  
  const videos: Array<{ filename: string; url: string }> = []
  
  for (const line of lines) {
    // 跳过空行和表头行
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine === '"文件名","外链地址"') continue
    
    // 解析 CSV 行，处理带引号的字段
    // 支持两种格式：带引号的和不带引号的
    const quotedMatch = trimmedLine.match(/"(.*?)","(.*?)"/)
    if (quotedMatch && quotedMatch.length === 3) {
      const filename = quotedMatch[1]
      const url = quotedMatch[2]
      videos.push({ filename, url })
    } else {
      // 尝试不带引号的格式
      const parts = trimmedLine.split(',')
      if (parts.length >= 2) {
        const filename = parts[0].replace(/^"|"$/g, '')
        const url = parts.slice(1).join(',').replace(/^"|"$/g, '')
        if (filename && url) {
          videos.push({ filename, url })
        }
      }
    }
  }
  
  return videos
}

/**
 * 从文件路径提取文件名（不含路径）
 */
function extractFileName(filePath: string): string {
  const parts = filePath.split('/')
  return parts[parts.length - 1] || filePath
}

/**
 * 从文件名生成友好的显示名称
 */
function generateDisplayNameFromPath(filePath: string): string {
  // 提取文件名（不含路径和扩展名）
  const fileName = extractFileName(filePath)
  let name = fileName.replace(/\.[^/.]+$/, '')
  
  // 移除 "video/" 前缀（如果存在）
  name = name.replace(/^video\//, '')
  
  // 处理数字开头的文件名，如 "10.数据可视化" -> "数据可视化"
  name = name.replace(/^\d+\.\s*/, '')
  
  // 如果名称仍然包含路径分隔符，只取最后一部分
  if (name.includes('/')) {
    const parts = name.split('/')
    name = parts[parts.length - 1]
  }
  
  return name || fileName
}

/**
 * 获取视频文件列表
 * 优先从 CSV 文件加载，如果不存在则从 videos.json 加载
 */
export async function getVideoList(): Promise<VideoInfo[]> {
  try {
    // 首先尝试加载 CSV 文件
    const csvResponse = await fetch('/videos/export_urls.csv')
    if (csvResponse.ok) {
      const csvText = await csvResponse.text()
      const csvData = parseCSV(csvText)
      console.log('CSV 解析结果:', csvData.length, '条视频')
      
      if (csvData.length > 0) {
        return csvData.map((item) => {
          const fileName = extractFileName(item.filename)
          const videoUrl = item.url
          const format = getVideoFormat(videoUrl)
          return {
            name: fileName,
            displayName: generateDisplayNameFromPath(item.filename),
            url: videoUrl, // 使用 CSV 中的外链地址
            thumbnail: undefined,
            isSupported: isBrowserSupportedFormat(videoUrl),
            format: format
          }
        })
      }
    }
    
    // 如果 CSV 文件不存在，尝试加载 JSON 配置文件
    const jsonResponse = await fetch('/videos/videos.json')
    if (jsonResponse.ok) {
      const videoList = await jsonResponse.json()
      return videoList.map((video: any) => {
        const videoUrl = `/videos/${video.name}`
        const format = getVideoFormat(videoUrl)
        return {
          name: video.name,
          displayName: video.displayName || generateDisplayName(video.name),
          url: videoUrl,
          thumbnail: video.thumbnail ? (video.thumbnail.startsWith('/') ? video.thumbnail : `/videos/${video.thumbnail}`) : undefined,
          isSupported: isBrowserSupportedFormat(videoUrl),
          format: format
        }
      })
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

