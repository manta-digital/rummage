import path from 'node:path'
import fs from 'node:fs/promises'

export const getFixturePath = (filename: string): string => 
  path.join(__dirname, '../fixtures', filename)

export const getFixtureContent = async (filename: string): Promise<string> => {
  const filePath = getFixturePath(filename)
  return await fs.readFile(filePath, 'utf-8')
}

export const getFixtureFiles = async (subdirectory: string = ''): Promise<string[]> => {
  const dirPath = path.join(__dirname, '../fixtures', subdirectory)
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    return files
      .filter(dirent => dirent.isFile())
      .map(dirent => path.join(subdirectory, dirent.name))
  } catch (error) {
    console.warn(`Could not read fixture directory ${dirPath}:`, error)
    return []
  }
}

export const loadSqlFixture = async (filename: string): Promise<string[]> => {
  const content = await getFixtureContent(filename)
  return content
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0)
}