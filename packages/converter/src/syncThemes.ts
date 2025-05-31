import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import prompts from 'prompts'

// ESM __dirname shim:
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const themesSourceDir = path.resolve(__dirname, 'data/shadcn/themes')
const themesDestDir = path.resolve(__dirname, '../../cli/data/themes')

async function main() {
  // Ensure the destination exists
  await fs.ensureDir(themesDestDir)

  const files = (await fs.readdir(themesSourceDir)).filter((f) => f.endsWith('.json'))

  let copied = 0
  let skipped = 0

  for (const file of files) {
    const srcFile = path.join(themesSourceDir, file)
    const destFile = path.join(themesDestDir, file)

    let shouldCopy = true
    if (await fs.pathExists(destFile)) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `File "${file}" already exists in CLI. Overwrite?`,
        initial: false,
      })
      shouldCopy = !!response.overwrite
    }

    if (shouldCopy) {
      await fs.copy(srcFile, destFile)
      console.log(`✅ Copied: ${file}`)
      copied++
    } else {
      console.log(`⏩ Skipped: ${file}`)
      skipped++
    }
  }

  console.log(`\nDone! ${copied} file(s) copied, ${skipped} file(s) skipped.`)
}

main().catch((err) => {
  console.error('Error syncing themes:', err)
  process.exit(1)
})
