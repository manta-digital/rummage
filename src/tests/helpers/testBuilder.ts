import type { FileInfo } from './mockFs'

export const fileBuilder = () => {
  let data: Partial<FileInfo> = {}
  
  const builder = {
    withPath: (path: string) => {
      data.path = path
      return builder
    },
    withName: (name: string) => {
      data.name = name
      return builder
    },
    withSize: (size: number) => {
      data.size = size
      return builder
    },
    withMimeType: (mimeType: string) => {
      data.mimeType = mimeType
      return builder
    },
    withCreatedAt: (createdAt: number) => {
      data.createdAt = createdAt
      return builder
    },
    withModifiedAt: (modifiedAt: number) => {
      data.modifiedAt = modifiedAt
      return builder
    },
    withMetadata: (metadata: Record<string, any>) => {
      data.metadata = metadata
      return builder
    },
    build: (): FileInfo => {
      // Set defaults for required fields
      return {
        path: data.path || '/test/file.txt',
        name: data.name || 'file.txt',
        size: data.size || 100,
        mimeType: data.mimeType || 'text/plain',
        createdAt: data.createdAt || Date.now(),
        modifiedAt: data.modifiedAt || Date.now(),
        metadata: data.metadata || {}
      }
    }
  }
  
  return builder
}

export const scanResultBuilder = () => {
  let data: any = {}
  
  const builder = {
    withSuccess: (success: boolean) => {
      data.success = success
      return builder
    },
    withFilesFound: (count: number) => {
      data.filesFound = count
      return builder
    },
    withError: (error: string) => {
      data.error = error
      return builder
    },
    build: () => ({
      success: data.success ?? true,
      filesFound: data.filesFound ?? 0,
      error: data.error
    })
  }
  
  return builder
}