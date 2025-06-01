import type { AddComponentOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import prettier from 'prettier'

// Prettier parser mapping
const parserByType: Record<string, prettier.BuiltInParserName> = {
  tsx: 'typescript',
  ts: 'typescript',
  css: 'css',
  scss: 'scss',
}

export async function addSingleComponent({ targetDir, files }: AddComponentOptions) {
  // Ensure targetDir exists
  fs.mkdirSync(targetDir, { recursive: true })

  for (const file of files) {
    const filePath = path.join(targetDir, `${file.name}.${file.type}`)

    // Pick Prettier parser if possible
    let formattedContent = file.content
    const parser = parserByType[file.type]

    if (parser) {
      try {
        formattedContent = await prettier.format(file.content, { parser })
      } catch (err) {
        // If formatting fails, fallback to raw content and warn
        console.warn(`⚠️ Prettier formatting failed for ${filePath}:`, err)
      }
    }

    fs.writeFileSync(filePath, formattedContent)
  }
}
