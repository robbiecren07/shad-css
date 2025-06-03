import type { ShadCssConfig } from '@/types'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import { runInit } from './init'
import { detectPackageManager } from '@/utils/helpers'
import { addComponents } from '@/utils/addComponents'
import { installDependency } from '@/utils/installDependency'

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

      // Validate that the component exists in the registry
      const componentPath = path.join(
        __dirname,
        '../data/components',
        config.theme,
        `${component}.json`
      )
      if (!fs.existsSync(componentPath)) {
        throw new Error(`Component '${component}' not found for theme '${config.theme}'`)
      }

      // install the component
      const packageManager = detectPackageManager()
      const visited = new Set<string>()
      const depsSet = new Set<string>()

      await addComponents({
        component,
        config,
        options: { overwrite: options.overwrite, visited },
        __dirname,
        packageManager,
        depsSet,
      })

      // install package dependencies if any
      if (depsSet.size > 0) {
        installDependency(Array.from(depsSet), packageManager)
      }

      console.log(`\n✅ Successfully added ${component} component!`)
    } catch (error: unknown) {
      console.error(
        'Error adding component:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      process.exit(1)
    }
  })
