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

export async function addSingleComponent({ targetDir, config, files }: AddComponentOptions) {
  // Ensure targetDir exists
  fs.mkdirSync(targetDir, { recursive: true })

  // Normalize the output dir for import replacement (strip 'src/' if present, ensure leading '@/')
  let outputDirForImport = config.outputDir.replace(/^src\//, '').replace(/^\//, '')
  if (!outputDirForImport.startsWith('components/')) {
    // Edge case: just in case, fallback to config.outputDir as-is
    outputDirForImport = config.outputDir.replace(/^src\//, '').replace(/^\//, '')
  }
  // Always ensure no trailing slash
  outputDirForImport = outputDirForImport.replace(/\/$/, '')

  for (const file of files) {
    const filePath = path.join(targetDir, `${file.name}.${file.type}`)
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

    // Replace any registry import path with the correct outputDir
    if (file.type === 'tsx') {
      formattedContent = formattedContent.replace(
        /@\/registry\/(?:default|new-york)\/ui\//g,
        `@/${outputDirForImport}/`
      )
    }

    fs.writeFileSync(filePath, formattedContent)
  }
}
