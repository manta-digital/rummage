export interface FileInfo {
  path: string
  name: string
  size: number
  mimeType: string
  createdAt: number
  modifiedAt: number
  metadata: Record<string, any>
}

export interface FileMetadata {
  width?: number
  height?: number
  camera?: string
  model?: string
  dateTime?: string
}

export class MockFileSystemService {
  private fixtureFiles: FileInfo[] = [
    {
      path: '/test/fixtures/image.png',
      name: 'image.png',
      size: 1024,
      mimeType: 'image/png',
      createdAt: 1630000000000,
      modifiedAt: 1630000000000,
      metadata: { width: 100, height: 100 }
    },
    {
      path: '/test/fixtures/document.pdf',
      name: 'document.pdf',
      size: 2048,
      mimeType: 'application/pdf',
      createdAt: 1630000000000,
      modifiedAt: 1630000000000,
      metadata: {}
    }
  ]

  async scanDirectory(path: string): Promise<FileInfo[]> {
    // Return fixture data based on path
    if (path.includes('fixtures')) {
      return this.fixtureFiles
    }
    return []
  }

  async getFileMetadata(path: string): Promise<FileMetadata> {
    // Return mock metadata based on file type
    if (path.includes('.png') || path.includes('.jpg')) {
      return {
        width: 100,
        height: 100,
        camera: 'Test Camera',
        model: 'Test Model'
      }
    }
    return {}
  }
}