import type { AddComponentOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import prettier from 'prettier'

export async function addSingleComponent({ targetDir, config, files }: AddComponentOptions) {
  // Ensure targetDir exists
  fs.mkdirSync(targetDir, { recursive: true })

  // Normalize output dir for import path replacement (strip 'src/', no leading slash)
  let outputDirForImport = config.outputDir
    .replace(/^src\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')

  for (const file of files) {
    // Only handle .tsx and .css files in the "files" array
    if (file.type === 'tsx') {
      const filePath = path.join(targetDir, `${file.name}.tsx`)
      let formattedContent = file.content

      try {
        formattedContent = await prettier.format(file.content, { parser: 'typescript' })
      } catch (err) {
        console.warn(`⚠️ Prettier formatting failed for ${filePath}:`, err)
      }

      // Replace registry imports with correct component alias
      formattedContent = formattedContent.replace(
        /@\/registry\/(?:default|new-york)\/ui\//g,
        `@/${outputDirForImport}/`
      )

      // Replace CSS imports with SCSS imports if moduleStyleType is scss
      if (config.moduleStyleType === 'scss') {
        formattedContent = formattedContent.replace(/module\.css(['"])/g, 'module.scss$1')
      }

      fs.writeFileSync(filePath, formattedContent)
      continue
    }

    // Only output the css or scss file depending on user's config
    if (file.type === config.moduleStyleType) {
      // output the file with the correct extension from user's config
      const filePath = path.join(targetDir, `${file.name}.${config.moduleStyleType}`)
      let formattedContent = file.content

      try {
        formattedContent = await prettier.format(file.content, { parser: config.moduleStyleType })
      } catch (err) {
        console.warn(`⚠️ Prettier formatting failed for ${filePath}:`, err)
      }

      fs.writeFileSync(filePath, formattedContent)
      continue
    }
  }
}
