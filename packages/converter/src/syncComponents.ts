import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import prompts from 'prompts'

// ESM __dirname shim:
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- Command line options ---
const style = process.argv[2]

if (!style || !['default', 'new-york'].includes(style)) {
  console.error(
    '❌ You must provide a style ("default" or "new-york").\n\nExample: npm run sync:components default'
  )
  process.exit(1)
}

const srcDir = path.resolve(__dirname, `components/${style}`)
const destDir = path.resolve(__dirname, `../../cli/data/components/${style}`)

async function main() {
  if (!(await fs.pathExists(srcDir))) {
    console.error(`❌ Source directory does not exist: ${srcDir}`)
    process.exit(1)
  }

  await fs.ensureDir(destDir)

  const allNames = await fs.readdir(srcDir)
  const componentFolders = []
  for (const name of allNames) {
    if ((await fs.stat(path.join(srcDir, name))).isDirectory()) {
      componentFolders.push(name)
    }
  }

  let copied = 0
  let skipped = 0

  for (const component of componentFolders) {
    const srcComponentDir = path.join(srcDir, component)
    const srcJson = path.join(srcComponentDir, `${component}.json`)
    const destJson = path.join(destDir, `${component}.json`)

    if (!(await fs.pathExists(srcJson))) {
      console.warn(`⚠️  Missing JSON: ${srcJson}`)
      continue
    }

    let shouldCopy = true
    if (await fs.pathExists(destJson)) {
      const response = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `File "${style}/${component}.json" exists in CLI. Overwrite?`,
        initial: false,
      })
      shouldCopy = !!response.overwrite
    }

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

main().catch((err) => {
  console.error('Error syncing components:', err)
  process.exit(1)
})
