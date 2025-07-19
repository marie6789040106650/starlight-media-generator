import { mkdir, access, readdir, unlink, rmdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { constants } from 'fs'

/**
 * 优化的临时文件管理器
 * 支持文件缓存、批量清理和性能监控
 */
export class OptimizedTempFileManager {
  private tempDir: string | null = null
  private files: Map<string, FileInfo> = new Map()
  private cacheEnabled: boolean = true
  private maxCacheSize: number = 100 * 1024 * 1024 // 100MB
  private currentCacheSize: number = 0
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: TempFileManagerOptions = {}) {
    this.cacheEnabled = options.enableCache ?? true
    this.maxCacheSize = options.maxCacheSize ?? 100 * 1024 * 1024
    
    // 启动定期清理
    if (options.autoCleanup !== false) {
      this.startAutoCleanup(options.cleanupInterval ?? 30 * 60 * 1000) // 30分钟
    }
  }

  /**
   * 创建临时目录
   */
  async createTempDirectory(): Promise<string> {
    if (this.tempDir && await this.directoryExists(this.tempDir)) {
      return this.tempDir
    }

    const baseTempDir = tmpdir()
    const tempDirName = `pdf-conversion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    this.tempDir = join(baseTempDir, tempDirName)
    
    await mkdir(this.tempDir, { recursive: true })
    console.log(`📁 创建临时目录: ${this.tempDir}`)
    return this.tempDir
  }

  /**
   * 添加Word文件到管理器
   */
  async addWordFile(content: string, storeName: string, options: WordFileOptions = {}): Promise<string> {
    const tempDir = await this.createTempDirectory()
    const timestamp = Date.now()
    const filename = options.filename || `document-${timestamp}.docx`
    const filePath = join(tempDir, filename)

    // 检查缓存
    const cacheKey = this.generateCacheKey(content, storeName, options)
    if (this.cacheEnabled && this.files.has(cacheKey)) {
      const cachedFile = this.files.get(cacheKey)!
      if (await this.fileExists(cachedFile.path)) {
        console.log(`📋 使用缓存的Word文件: ${cachedFile.path}`)
        cachedFile.lastAccessed = Date.now()
        cachedFile.accessCount++
        return cachedFile.path
      } else {
        // 缓存文件不存在，移除缓存记录
        this.files.delete(cacheKey)
        this.currentCacheSize -= cachedFile.size
      }
    }

    // 生成新的Word文件
    console.log(`📝 生成新的Word文件: ${filePath}`)
    const { WordGenerator } = await import('./export/word-generator')
    const wordGenerator = new WordGenerator()
    
    await wordGenerator.generateWordDocumentToFile({
      content,
      storeName,
      bannerImage: options.bannerImage,
      filename: filePath,
      includeWatermark: options.includeWatermark
    })

    // 获取文件大小
    const fileStats = await this.getFileStats(filePath)
    const fileInfo: FileInfo = {
      path: filePath,
      size: fileStats.size,
      created: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      cacheKey
    }

    // 添加到缓存
    if (this.cacheEnabled) {
      await this.addToCache(cacheKey, fileInfo)
    }

    this.files.set(cacheKey, fileInfo)
    console.log(`✅ Word文件生成完成: ${filePath} (${fileStats.size} bytes)`)
    
    return filePath
  }

  /**
   * 获取临时目录路径
   */
  getTempDir(): string | null {
    return this.tempDir
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): CacheStats {
    const files = Array.from(this.files.values())
    return {
      totalFiles: files.length,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      hitRate: this.calculateHitRate(),
      oldestFile: files.reduce((oldest, file) => 
        !oldest || file.created < oldest.created ? file : oldest, null as FileInfo | null
      ),
      mostAccessed: files.reduce((most, file) => 
        !most || file.accessCount > most.accessCount ? file : most, null as FileInfo | null
      )
    }
  }

  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(maxAge: number = 60 * 60 * 1000): Promise<number> {
    const now = Date.now()
    let cleanedCount = 0
    const filesToRemove: string[] = []

    for (const [cacheKey, fileInfo] of this.files.entries()) {
      if (now - fileInfo.lastAccessed > maxAge) {
        try {
          await unlink(fileInfo.path)
          filesToRemove.push(cacheKey)
          this.currentCacheSize -= fileInfo.size
          cleanedCount++
          console.log(`🗑️ 清理过期文件: ${fileInfo.path}`)
        } catch (error) {
          console.warn(`清理文件失败 ${fileInfo.path}:`, error)
        }
      }
    }

    // 从缓存中移除
    filesToRemove.forEach(key => this.files.delete(key))

    if (cleanedCount > 0) {
      console.log(`🧹 清理完成，删除了 ${cleanedCount} 个过期文件`)
    }

    return cleanedCount
  }

  /**
   * 完全清理所有文件
   */
  async cleanup(): Promise<void> {
    // 清理所有文件
    const cleanupPromises = Array.from(this.files.values()).map(fileInfo =>
      unlink(fileInfo.path).catch(error => 
        console.warn(`清理文件失败 ${fileInfo.path}:`, error)
      )
    )

    await Promise.all(cleanupPromises)
    this.files.clear()
    this.currentCacheSize = 0

    // 清理临时目录
    if (this.tempDir) {
      try {
        const files = await readdir(this.tempDir)
        
        // 删除剩余文件
        await Promise.all(
          files.map(file => 
            unlink(join(this.tempDir!, file)).catch(error => 
              console.warn(`清理文件失败 ${file}:`, error)
            )
          )
        )
        
        // 删除目录
        await rmdir(this.tempDir)
        console.log(`🗑️ 清理临时目录: ${this.tempDir}`)
      } catch (error) {
        console.warn(`清理临时目录失败 ${this.tempDir}:`, error)
      }
      this.tempDir = null
    }

    // 停止自动清理
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * 强制清理缓存以释放空间
   */
  async forceCacheCleanup(): Promise<void> {
    const files = Array.from(this.files.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed) // 按最后访问时间排序

    const targetSize = this.maxCacheSize * 0.7 // 清理到70%
    let currentSize = this.currentCacheSize

    for (const [cacheKey, fileInfo] of files) {
      if (currentSize <= targetSize) break

      try {
        await unlink(fileInfo.path)
        this.files.delete(cacheKey)
        currentSize -= fileInfo.size
        console.log(`🗑️ 强制清理缓存文件: ${fileInfo.path}`)
      } catch (error) {
        console.warn(`强制清理文件失败 ${fileInfo.path}:`, error)
      }
    }

    this.currentCacheSize = currentSize
    console.log(`🧹 强制清理完成，当前缓存大小: ${this.formatBytes(this.currentCacheSize)}`)
  }

  // 私有方法

  private generateCacheKey(content: string, storeName: string, options: WordFileOptions): string {
    const crypto = require('crypto')
    const data = JSON.stringify({ content, storeName, options })
    return crypto.createHash('md5').update(data).digest('hex')
  }

  private async addToCache(cacheKey: string, fileInfo: FileInfo): Promise<void> {
    // 检查缓存大小限制
    if (this.currentCacheSize + fileInfo.size > this.maxCacheSize) {
      await this.forceCacheCleanup()
    }

    this.currentCacheSize += fileInfo.size
  }

  private calculateHitRate(): number {
    const files = Array.from(this.files.values())
    if (files.length === 0) return 0

    const totalAccess = files.reduce((sum, file) => sum + file.accessCount, 0)
    const cacheHits = files.reduce((sum, file) => sum + (file.accessCount - 1), 0)
    
    return totalAccess > 0 ? (cacheHits / totalAccess) * 100 : 0
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await access(path, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  private async getFileStats(path: string): Promise<{ size: number }> {
    const fs = await import('fs/promises')
    const stats = await fs.stat(path)
    return { size: stats.size }
  }

  private startAutoCleanup(interval: number): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupExpiredFiles()
      } catch (error) {
        console.warn('自动清理失败:', error)
      }
    }, interval)
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// 类型定义
export interface TempFileManagerOptions {
  enableCache?: boolean
  maxCacheSize?: number
  autoCleanup?: boolean
  cleanupInterval?: number
}

export interface WordFileOptions {
  filename?: string
  bannerImage?: string | null
  includeWatermark?: boolean
}

interface FileInfo {
  path: string
  size: number
  created: number
  lastAccessed: number
  accessCount: number
  cacheKey: string
}

export interface CacheStats {
  totalFiles: number
  totalSize: number
  maxSize: number
  hitRate: number
  oldestFile: FileInfo | null
  mostAccessed: FileInfo | null
}

// 单例实例（可选）
let globalTempFileManager: OptimizedTempFileManager | null = null

export function getGlobalTempFileManager(options?: TempFileManagerOptions): OptimizedTempFileManager {
  if (!globalTempFileManager) {
    globalTempFileManager = new OptimizedTempFileManager(options)
  }
  return globalTempFileManager
}

// 清理全局实例
export async function cleanupGlobalTempFileManager(): Promise<void> {
  if (globalTempFileManager) {
    await globalTempFileManager.cleanup()
    globalTempFileManager = null
  }
}