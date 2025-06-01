import type { ComponentData, ShadCssConfig } from '@/types'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import { readFileSync } from 'fs'
import { runInit } from './init'
import { detectPackageManager } from '@/utils/helpers'
import { addComponents } from '@/utils/addComponents'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const add = new Command()
  .name('add')
  .argument('<component>', 'Shadcn component name (e.g. button)')
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .action(async (component, options) => {
    try {
      // Load configuration
      let config: ShadCssConfig
      const configPath = path.join(process.cwd(), 'shad-css.json')

      // Check if shad-css.json exists
      if (!fs.existsSync(configPath)) {
        const { shouldInit } = await prompts({
          type: 'toggle',
          name: 'shouldInit',
          message: 'No shad-css.json found. Initialize now?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        })

        if (!shouldInit) {
          console.log('shad-css add cancelled.')
          process.exit(1)
        }

        // Run initialization if config doesn't exist
        config = await runInit()
      } else {
        // Read existing configuration
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      }

      // Load component metadata
      const componentPath = path.join(
        __dirname,
        '../data/components',
        config.theme,
        `${component}.json`
      )
      if (!fs.existsSync(componentPath)) {
        throw new Error(`Component '${component}' not found for theme '${config.theme}'`)
      }

      const componentData: ComponentData = JSON.parse(readFileSync(componentPath, 'utf-8'))

      // Create target directory
      const targetDir = path.join(process.cwd(), config.outputDir, component)
      fs.mkdirSync(targetDir, { recursive: true })

      // Check if component files already exist
      const existingFiles = componentData.files.filter((file) => {
        const filePath = path.join(targetDir, `${file.name}.${file.type}`)
        return fs.existsSync(filePath)
      })

      let shouldOverwrite = options.overwrite

      if (!shouldOverwrite && existingFiles.length > 0) {
        const { overwriteConfirmed } = await prompts({
          type: 'toggle',
          name: 'overwriteConfirmed',
          message: `Component '${component}' already exists. Overwrite?`,
          initial: false,
          active: 'yes',
          inactive: 'no',
        })
        shouldOverwrite = overwriteConfirmed
      }

      if (existingFiles.length > 0 && !shouldOverwrite) {
        console.log('Add command cancelled. No files were overwritten.')
        process.exit(0)
      }

      const packageManager = detectPackageManager()

      await addComponents({
        component,
        config,
        options: { overwrite: options.overwrite },
        __dirname,
        packageManager,
      })
    } catch (error: unknown) {
      console.error(
        'Error adding component:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      process.exit(1)
    }
  })
