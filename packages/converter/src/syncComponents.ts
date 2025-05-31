import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import prompts from 'prompts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Validate command line arguments
// Expects a style parameter ("default" or "new-york")
const style = process.argv[2]
if (!style || !['default', 'new-york'].includes(style)) {
  console.error(
    '❌ You must provide a style ("default" or "new-york").\n\nExample: npm run sync:components default'
  )
  process.exit(1)
}

// Define source and destination directories
// Source: Converted components directory
// Destination: CLI components data directory
const srcDir = path.resolve(__dirname, `components/${style}`)
const destDir = path.resolve(__dirname, `../../cli/data/components/${style}`)

/**
 * Synchronizes component JSON files from the converter to the CLI data directory.
 *
 * This function:
 * 1. Validates the source directory exists
 * 2. Creates the destination directory if needed
 * 3. Copies component JSON files from source to destination
 * 4. Prompts for confirmation when overwriting existing files
 * 5. Tracks and reports copied vs skipped files
 */
async function main() {
  if (!(await fs.pathExists(srcDir))) {
    console.error(`❌ Source directory does not exist: ${srcDir}`)
    process.exit(1)
  }

  // Create destination directory if it doesn't exist
  await fs.ensureDir(destDir)

  // Retrieve and filter component directories
  // Only process directories (skip loose files)
  const allNames = await fs.readdir(srcDir)
  const componentFolders = []
  for (const name of allNames) {
    if ((await fs.stat(path.join(srcDir, name))).isDirectory()) {
      componentFolders.push(name)
    }
  }

  let copied = 0
  let skipped = 0

  // Process each component directory
  // For each component:
  // 1. Build source and destination paths
  // 2. Check for source JSON existence
  // 3. Prompt for overwrite if destination exists
  // 4. Copy or skip based on user input
  for (const component of componentFolders) {
    const srcComponentDir = path.join(srcDir, component)
    const srcJson = path.join(srcComponentDir, `${component}.json`)
    const destJson = path.join(destDir, `${component}.json`)

    // Skip if source JSON file doesn't exist
    if (!(await fs.pathExists(srcJson))) {
      console.warn(`⚠️  Missing JSON: ${srcJson}`)
      continue
    }

    let shouldCopy = true
    // Prompt to overwrite if destination JSON file exists
    if (await fs.pathExists(destJson)) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `File "${style}/${component}.json" exists in CLI. Overwrite?`,
        initial: false,
      })
      shouldCopy = !!response.overwrite
    }

    // Copy if shouldCopy is true
    if (shouldCopy) {
      await fs.copy(srcJson, destJson)
      console.log(`✅ Copied: ${component}.json`)
      copied++
    } else {
      console.log(`⏩ Skipped: ${component}.json`)
      skipped++
    }
  }

  console.log(`\nDone! ${copied} file(s) copied, ${skipped} file(s) skipped for style "${style}".`)
}

// Error handling for the sync process
main().catch((err) => {
  console.error('Error syncing components:', err)
  process.exit(1)
})
