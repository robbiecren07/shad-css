import type { ComponentData } from '@/types'
import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { detectPackageManager } from '@/utils/helpers'

export const add = new Command()
  .name('add')
  .argument('<component>', 'Shadcn component name (e.g. button)')
  .argument('<style>', 'Style name (e.g. default, new-york)')
  .action(async (component, style) => {
    try {
      // Load configuration
      const configPath = path.join(process.cwd(), '.shadcssrc')
      const config = JSON.parse(readFileSync(configPath, 'utf-8'))

      // Load component metadata
      const componentPath = path.join(__dirname, '.', 'components', style, `${component}.json`)
      if (!fs.existsSync(componentPath)) {
        throw new Error(`Component '${component}' not found for style '${style}'`)
      }

      const componentData: ComponentData = JSON.parse(readFileSync(componentPath, 'utf-8'))

      // Create target directory
      const targetDir = path.join(process.cwd(), config.outputDir, style, component)
      fs.mkdirSync(targetDir, { recursive: true })

      // Write files
      fs.writeFileSync(path.join(targetDir, `${component}.tsx`), componentData.tsx)
      fs.writeFileSync(path.join(targetDir, `${component}.module.css`), componentData.css)

      // Install dependencies
      const packageManager = detectPackageManager()
      const dependencies = [...componentData.radixDependencies]
      if (dependencies.length > 0) {
        const installCmd = `${packageManager} install ${dependencies.join(' ')}`
        execSync(installCmd, { stdio: 'inherit' })
      }

      console.log(`\nSuccessfully added ${component} component!`)
      console.log(`You can now use it like this: <${componentData.name} />`)
    } catch (error: unknown) {
      console.error(
        'Error adding component:',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  })
