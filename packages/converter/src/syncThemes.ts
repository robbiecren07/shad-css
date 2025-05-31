import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import prompts from 'prompts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define source and destination directories for theme files
// Source: Shadcn theme data directory
// Destination: CLI theme data directory
const themesSourceDir = path.resolve(__dirname, 'data/shadcn/themes')
const themesDestDir = path.resolve(__dirname, '../../cli/data/themes')

/**
 * Synchronizes theme JSON files from the converter to the CLI data directory.
 *
 * This function:
 * 1. Creates the destination directory if needed
 * 2. Filters and retrieves all JSON theme files from source
 * 3. Copies each theme file to destination with user confirmation
 * 4. Tracks and reports copied vs skipped files
 */
async function main() {
  // Create destination directory if it doesn't exist
  await fs.ensureDir(themesDestDir)

  // Retrieve all JSON theme files from source directory
  const files = (await fs.readdir(themesSourceDir)).filter((f) => f.endsWith('.json'))

  let copied = 0
  let skipped = 0

  // Process each theme file
  // For each file:
  // 1. Build source and destination paths
  // 2. Check for existing destination file
  // 3. Prompt for overwrite if needed
  // 4. Copy or skip based on user input
  for (const file of files) {
    const srcFile = path.join(themesSourceDir, file)
    const destFile = path.join(themesDestDir, file)

    let shouldCopy = true
    // Skip if destination file exists
    if (await fs.pathExists(destFile)) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `File "${file}" already exists in CLI. Overwrite?`,
        initial: false,
      })
      shouldCopy = !!response.overwrite
    }

    // Copy if shouldCopy is true
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

// Error handling for the sync process
main().catch((err) => {
  console.error('Error syncing themes:', err)
  process.exit(1)
})
