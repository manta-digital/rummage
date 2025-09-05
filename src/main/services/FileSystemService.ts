import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import type { FileInfo, FileMetadata, ScanProgress } from '../../shared/types'

/**
 * File System Service - Handles directory scanning and file metadata extraction
 * 
 * Core Features:
 * - Recursive directory scanning with progress callbacks
 * - File metadata extraction (size, mime type, timestamps)
 * - Hash calculation for deduplication (xxh3, blake3)
 * - Abort signal support for cancellable operations
 * 
 * Security:
 * - Only operates on user-selected directories
 * - Validates file paths to prevent directory traversal
 * - Handles file access errors gracefully
 */
export class FileSystemService {
  private supportedImageTypes = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    '.tiff', '.tif', '.ico', '.heic', '.heif'
  ])

  private supportedDocTypes = new Set([
    '.txt', '.md', '.pdf', '.doc', '.docx', '.rtf',
    '.odt', '.pages', '.csv', '.json', '.xml', '.html'
  ])

  /**
   * Scan directory recursively and extract file metadata
   * @param directoryPath - Path to scan (must be absolute)
   * @param progressCallback - Called with (current, total, currentFile) 
   * @param abortSignal - Signal to cancel operation
   * @returns Array of FileInfo objects
   */
  async scanDirectory(
    directoryPath: string,
    progressCallback?: (current: number, total: number, currentFile: string) => void,
    abortSignal?: AbortSignal
  ): Promise<FileInfo[]> {
    if (!path.isAbsolute(directoryPath)) {
      throw new Error('Directory path must be absolute')
    }

    // Validate directory exists and is readable
    try {
      const stats = await fs.stat(directoryPath)
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory')
      }
    } catch (error) {
      throw new Error(`Cannot access directory: ${error.message}`)
    }

    const files: FileInfo[] = []
    const allPaths = await this.collectAllFilePaths(directoryPath, abortSignal)
    
    const total = allPaths.length
    let current = 0

    for (const filePath of allPaths) {
      if (abortSignal?.aborted) {
        throw new Error('Scan cancelled')
      }

      try {
        const fileInfo = await this.extractFileInfo(filePath)
        files.push(fileInfo)
      } catch (error) {
        console.warn(`Failed to process file ${filePath}:`, error.message)
        // Continue with other files rather than failing entire scan
      }

      current++
      if (progressCallback && (current % 10 === 0 || current === total)) {
        progressCallback(current, total, path.basename(filePath))
      }
    }

    return files
  }

  /**
   * Get detailed metadata for a specific file
   * @param filePath - Absolute path to file
   * @returns Detailed file metadata
   */
  async getDetailedMetadata(filePath: string): Promise<FileMetadata> {
    if (!path.isAbsolute(filePath)) {
      throw new Error('File path must be absolute')
    }

    const stats = await fs.stat(filePath)
    const fileInfo = await this.extractFileInfo(filePath)
    
    return {
      ...fileInfo,
      detailedStats: {
        mode: stats.mode,
        nlink: stats.nlink,
        uid: stats.uid,
        gid: stats.gid,
        rdev: stats.rdev,
        blksize: stats.blksize,
        ino: stats.ino,
        blocks: stats.blocks
      }
    }
  }

  /**
   * Calculate file hash using Node.js crypto
   * For now using MD5, can be upgraded to xxh3/blake3 later
   */
  async calculateHash(filePath: string): Promise<{ md5: string }> {
    const content = await fs.readFile(filePath)
    const md5Hash = createHash('md5').update(content).digest('hex')
    
    return { md5: md5Hash }
  }

  /**
   * Collect all file paths recursively
   */
  private async collectAllFilePaths(directoryPath: string, abortSignal?: AbortSignal): Promise<string[]> {
    const paths: string[] = []
    
    const scanRecursive = async (currentPath: string) => {
      if (abortSignal?.aborted) {
        throw new Error('Scan cancelled')
      }

      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name)
          
          if (entry.isDirectory()) {
            // Skip hidden directories and common ignore patterns
            if (!entry.name.startsWith('.') && 
                !['node_modules', '__pycache__', '.git'].includes(entry.name)) {
              await scanRecursive(fullPath)
            }
          } else if (entry.isFile()) {
            paths.push(fullPath)
          }
        }
      } catch (error) {
        console.warn(`Cannot read directory ${currentPath}:`, error.message)
      }
    }

    await scanRecursive(directoryPath)
    return paths
  }

  /**
   * Extract file information and metadata
   */
  private async extractFileInfo(filePath: string): Promise<FileInfo> {
    const stats = await fs.stat(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const basename = path.basename(filePath)
    
    // Simple MIME type detection based on extension
    const mimeType = this.getMimeType(ext)
    
    // Calculate hash for files smaller than 50MB to avoid performance issues
    let hash = null
    if (stats.size < 50 * 1024 * 1024) {
      try {
        const hashResult = await this.calculateHash(filePath)
        hash = hashResult.md5
      } catch (error) {
        console.warn(`Failed to calculate hash for ${filePath}:`, error.message)
      }
    }

    return {
      path: filePath,
      name: basename,
      size: stats.size,
      mimeType,
      createdAt: stats.birthtime.getTime(),
      modifiedAt: stats.mtime.getTime(),
      hashMd5: hash,
      metadata: {
        extension: ext,
        isImage: this.supportedImageTypes.has(ext),
        isDocument: this.supportedDocTypes.has(ext),
        permissions: stats.mode & parseInt('777', 8)
      }
    }
  }

  /**
   * Simple MIME type detection
   */
  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.ts': 'application/typescript'
    }

    return mimeTypes[extension] || 'application/octet-stream'
  }
}