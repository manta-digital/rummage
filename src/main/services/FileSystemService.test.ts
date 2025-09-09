import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { FileSystemService } from './FileSystemService'
import type { FileInfo } from '../../core/types'

// Mock Node.js filesystem
vi.mock('node:fs', () => ({
  promises: {
    stat: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn()
  }
}))

vi.mock('node:crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mock-md5-hash')
  }))
}))

const mockFs = fs as any
const mockStat = mockFs.stat as ReturnType<typeof vi.fn>
const mockReaddir = mockFs.readdir as ReturnType<typeof vi.fn>
const mockReadFile = mockFs.readFile as ReturnType<typeof vi.fn>

describe('FileSystemService', () => {
  let fileSystemService: FileSystemService
  let abortController: AbortController

  beforeEach(() => {
    fileSystemService = new FileSystemService()
    abortController = new AbortController()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('scanDirectory', () => {
    it('should validate directory path is absolute', async () => {
      const relativePath = 'relative/path'
      
      await expect(fileSystemService.scanDirectory(relativePath))
        .rejects.toThrow('Directory path must be absolute')
    })

    it('should validate directory exists and is readable', async () => {
      const absolutePath = '/non/existent/path'
      
      mockStat.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'))
      
      await expect(fileSystemService.scanDirectory(absolutePath))
        .rejects.toThrow('Cannot access directory')
    })

    it('should validate path is actually a directory', async () => {
      const filePath = '/path/to/file.txt'
      
      mockStat.mockResolvedValueOnce({
        isDirectory: () => false
      })
      
      await expect(fileSystemService.scanDirectory(filePath))
        .rejects.toThrow('Path is not a directory')
    })

    it('should scan directory and return file information', async () => {
      const testPath = '/test/directory'
      const mockFiles = [
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file2.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'subdir', isDirectory: () => true, isFile: () => false }
      ]
      
      // Mock directory stats
      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })  // Initial directory check
        .mockResolvedValueOnce({  // file1.txt stats
          isDirectory: () => false,
          size: 1024,
          birthtime: new Date('2024-01-01'),
          mtime: new Date('2024-01-02')
        })
        .mockResolvedValueOnce({  // file2.jpg stats
          isDirectory: () => false,
          size: 2048,
          birthtime: new Date('2024-01-03'),
          mtime: new Date('2024-01-04')
        })
        .mockResolvedValueOnce({ isDirectory: () => true })  // subdir stats
        .mockResolvedValueOnce({ isDirectory: () => true })  // subdir check in recursive call
      
      // Mock directory reading
      mockReaddir
        .mockResolvedValueOnce(mockFiles)  // Root directory
        .mockResolvedValueOnce([])         // Empty subdirectory
      
      // Mock file reading for hash calculation (small files)
      mockReadFile
        .mockResolvedValueOnce(Buffer.from('file1 content'))
        .mockResolvedValueOnce(Buffer.from('file2 content'))

      const progressCallback = vi.fn()
      const result = await fileSystemService.scanDirectory(testPath, progressCallback)

      expect(result).toHaveLength(2)
      
      // Verify file1.txt
      expect(result[0]).toMatchObject({
        path: path.join(testPath, 'file1.txt'),
        name: 'file1.txt',
        size: 1024,
        mimeType: 'text/plain',
        hashMd5: 'mock-md5-hash',
        metadata: {
          extension: '.txt',
          isImage: false,
          isDocument: true
        }
      })

      // Verify file2.jpg
      expect(result[1]).toMatchObject({
        path: path.join(testPath, 'file2.jpg'),
        name: 'file2.jpg', 
        size: 2048,
        mimeType: 'image/jpeg',
        hashMd5: 'mock-md5-hash',
        metadata: {
          extension: '.jpg',
          isImage: true,
          isDocument: false
        }
      })

      expect(progressCallback).toHaveBeenCalled()
    })

    it('should handle progress callbacks correctly', async () => {
      const testPath = '/test/directory'
      const mockFiles = Array.from({ length: 25 }, (_, i) => ({
        name: `file${i}.txt`,
        isDirectory: () => false,
        isFile: () => true
      }))

      mockStat.mockResolvedValue({ 
        isDirectory: () => i === 0 ? true : false,  // First call is directory check
        size: 100,
        birthtime: new Date(),
        mtime: new Date()
      })

      mockReaddir.mockResolvedValueOnce(mockFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const progressCallback = vi.fn()
      await fileSystemService.scanDirectory(testPath, progressCallback)

      // Progress should be called for every 10th file and at completion
      expect(progressCallback).toHaveBeenCalledWith(10, 25, expect.any(String))
      expect(progressCallback).toHaveBeenCalledWith(20, 25, expect.any(String))
      expect(progressCallback).toHaveBeenCalledWith(25, 25, expect.any(String))
    })

    it('should handle scan cancellation via AbortSignal', async () => {
      const testPath = '/test/directory'
      
      mockStat.mockResolvedValueOnce({ isDirectory: () => true })
      
      // Cancel immediately
      abortController.abort()

      await expect(fileSystemService.scanDirectory(testPath, undefined, abortController.signal))
        .rejects.toThrow('Scan cancelled')
    })

    it('should skip hidden directories and common ignore patterns', async () => {
      const testPath = '/test/directory'
      const mockFiles = [
        { name: '.hidden', isDirectory: () => true, isFile: () => false },
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: '__pycache__', isDirectory: () => true, isFile: () => false },
        { name: '.git', isDirectory: () => true, isFile: () => false },
        { name: 'normal.txt', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })  // Initial check
        .mockResolvedValueOnce({  // normal.txt
          isDirectory: () => false,
          size: 100,
          birthtime: new Date(),
          mtime: new Date()
        })

      mockReaddir.mockResolvedValueOnce(mockFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const result = await fileSystemService.scanDirectory(testPath)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('normal.txt')
    })

    it('should handle file access errors gracefully', async () => {
      const testPath = '/test/directory'
      const mockFiles = [
        { name: 'accessible.txt', isDirectory: () => false, isFile: () => true },
        { name: 'restricted.txt', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })  // Initial check
        .mockResolvedValueOnce({  // accessible.txt
          isDirectory: () => false,
          size: 100,
          birthtime: new Date(),
          mtime: new Date()
        })
        .mockRejectedValueOnce(new Error('Permission denied'))  // restricted.txt

      mockReaddir.mockResolvedValueOnce(mockFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const result = await fileSystemService.scanDirectory(testPath)

      // Should only include the accessible file
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('accessible.txt')
    })
  })

  describe('getDetailedMetadata', () => {
    it('should require absolute path', async () => {
      await expect(fileSystemService.getDetailedMetadata('relative/path'))
        .rejects.toThrow('File path must be absolute')
    })

    it('should return detailed metadata for file', async () => {
      const filePath = '/test/file.txt'
      const mockStats = {
        isDirectory: () => false,
        size: 1024,
        birthtime: new Date('2024-01-01'),
        mtime: new Date('2024-01-02'),
        mode: 33188,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 12345,
        blocks: 8
      }

      mockStat.mockResolvedValue(mockStats)
      mockReadFile.mockResolvedValue(Buffer.from('test content'))

      const result = await fileSystemService.getDetailedMetadata(filePath)

      expect(result).toMatchObject({
        path: filePath,
        name: 'file.txt',
        size: 1024,
        mimeType: 'text/plain',
        detailedStats: {
          mode: 33188,
          nlink: 1,
          uid: 1000,
          gid: 1000,
          rdev: 0,
          blksize: 4096,
          ino: 12345,
          blocks: 8
        }
      })
    })
  })

  describe('calculateHash', () => {
    it('should calculate MD5 hash of file content', async () => {
      const filePath = '/test/file.txt'
      const content = Buffer.from('test content')
      
      mockReadFile.mockResolvedValue(content)

      const result = await fileSystemService.calculateHash(filePath)

      expect(result).toEqual({ md5: 'mock-md5-hash' })
      expect(mockReadFile).toHaveBeenCalledWith(filePath)
    })
  })

  describe('MIME type detection', () => {
    it('should detect common image types', async () => {
      const testPath = '/test'
      const imageFiles = [
        { name: 'test.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'test.png', isDirectory: () => false, isFile: () => true },
        { name: 'test.gif', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })
        .mockResolvedValue({ 
          isDirectory: () => false, 
          size: 100, 
          birthtime: new Date(), 
          mtime: new Date() 
        })

      mockReaddir.mockResolvedValueOnce(imageFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const result = await fileSystemService.scanDirectory(testPath)

      expect(result[0].mimeType).toBe('image/jpeg')
      expect(result[1].mimeType).toBe('image/png')
      expect(result[2].mimeType).toBe('image/gif')
    })

    it('should detect common document types', async () => {
      const testPath = '/test'
      const docFiles = [
        { name: 'test.pdf', isDirectory: () => false, isFile: () => true },
        { name: 'test.txt', isDirectory: () => false, isFile: () => true },
        { name: 'test.md', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })
        .mockResolvedValue({ 
          isDirectory: () => false, 
          size: 100, 
          birthtime: new Date(), 
          mtime: new Date() 
        })

      mockReaddir.mockResolvedValueOnce(docFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const result = await fileSystemService.scanDirectory(testPath)

      expect(result[0].mimeType).toBe('application/pdf')
      expect(result[1].mimeType).toBe('text/plain')
      expect(result[2].mimeType).toBe('text/markdown')
    })

    it('should default to octet-stream for unknown extensions', async () => {
      const testPath = '/test'
      const unknownFiles = [
        { name: 'test.unknown', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })
        .mockResolvedValue({ 
          isDirectory: () => false, 
          size: 100, 
          birthtime: new Date(), 
          mtime: new Date() 
        })

      mockReaddir.mockResolvedValueOnce(unknownFiles)
      mockReadFile.mockResolvedValue(Buffer.from('test'))

      const result = await fileSystemService.scanDirectory(testPath)

      expect(result[0].mimeType).toBe('application/octet-stream')
    })
  })

  describe('Large file handling', () => {
    it('should skip hash calculation for files larger than 50MB', async () => {
      const testPath = '/test'
      const largeFile = [
        { name: 'large.bin', isDirectory: () => false, isFile: () => true }
      ]

      mockStat
        .mockResolvedValueOnce({ isDirectory: () => true })
        .mockResolvedValue({ 
          isDirectory: () => false, 
          size: 60 * 1024 * 1024, // 60MB
          birthtime: new Date(), 
          mtime: new Date() 
        })

      mockReaddir.mockResolvedValueOnce(largeFile)
      // Don't mock readFile - it shouldn't be called for large files

      const result = await fileSystemService.scanDirectory(testPath)

      expect(result[0].hashMd5).toBeNull()
      expect(mockReadFile).not.toHaveBeenCalled()
    })
  })
})