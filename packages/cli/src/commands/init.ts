import type { ShadCssConfig } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
import prompts from 'prompts'
import fg from 'fast-glob'
import { getThemeCssVars, injectCssVarsSmart } from '@/utils/themeVars'
import { detectPackageManager } from '@/utils/helpers'
import { installDependency } from '@/utils/installDependency'
import { createCnHelper } from '@/utils/createCnHelper'

export const init = new Command()
  .name('init')
  .description('Initialize shad-css in your project')
  .action(async () => {
    // Check if already initialized
    if (fs.existsSync('shad-css.json')) {
      console.log('\nError: shad-css is already initialized in this project.')
      console.log('Please remove the existing shad-css.json file if you want to reinitialize.')
      process.exit(1)
    }

    console.log('Initializing shad-css...')

    await runInit()
  })

export async function runInit(): Promise<ShadCssConfig> {
  try {
    // Check for tsconfig.json
    if (!fs.existsSync('tsconfig.json')) {
      console.error(
        '❌ Error: tsconfig.json not found. Please run this command in a TypeScript project.'
      )
      process.exit(1)
    }

    // Check for src directory
    const hasSrcDir = fs.existsSync('src')
    const srcDir = hasSrcDir ? 'src' : ''

    // Define default values
    const DEFAULT_OUTPUT_DIR = `${srcDir ? 'src/' : ''}components/ui`
    const DEFAULT_COMPONENTS_ALIAS = '@/*'

    // Recursively search for globals.css/scss, ignore build dirs
    const globalStyles = fg.sync(['**/globals.css', '**/globals.scss'], {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/out/**'],
      deep: 4,
    })

    let globalStylesheet: string

    if (globalStyles.length === 1) {
      globalStylesheet = globalStyles[0]
    } else if (globalStyles.length > 1) {
      const { chosen } = await prompts({
        type: 'select',
        name: 'chosen',
        message: 'Multiple globals.{css,scss} files found. Choose one:',
        choices: globalStyles.map((file) => ({ title: file, value: file })),
      })
      globalStylesheet = chosen
    } else {
      // Preferred creation order
      const candidateDirs = [path.join('src', 'app'), 'app', 'src', '.']
      let globalDir = '.'
      let globalPath = ''

      for (const dir of candidateDirs) {
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
          globalDir = dir
          break
        }
      }
      globalPath = path.join(globalDir, 'globals.css')

      const { createGlobal } = await prompts({
        type: 'toggle',
        name: 'createGlobal',
        message: `No globals.css or globals.scss found. Create one at "${globalPath}"?`,
        initial: true,
        active: 'yes',
        inactive: 'no',
      })

      if (!createGlobal) {
        console.error(
          '\n❌ Error: A global stylesheet is required to set base colors. Please add a globals.css or globals.scss to your project and re-run this command.'
        )
        process.exit(1)
      }

      fs.writeFileSync(globalPath, '/* shad-css generated global stylesheet */\n')
      globalStylesheet = globalPath
      console.log(`Created ${globalPath}`)
    }

    // Ask questions
    const options = await prompts([
      {
        type: 'select',
        name: 'theme',
        message: 'Which style would you like to use?',
        choices: [
          { title: 'New York', value: 'new-york' },
          { title: 'Default', value: 'default' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'baseColor',
        message: 'Which color would you like to use as the base color?',
        choices: [
          { title: 'Neutral', value: 'neutral' },
          { title: 'Gray', value: 'gray' },
          { title: 'Zinc', value: 'zinc' },
          { title: 'Stone', value: 'stone' },
          { title: 'Slate', value: 'slate' },
        ],
        initial: 0,
      },
      {
        type: 'text',
        name: 'outputDir',
        message: 'Where would you like to install the components?',
        initial: DEFAULT_OUTPUT_DIR,
      },
      {
        type: 'text',
        name: 'componentsAlias',
        message: 'Configure the import alias for components:',
        initial: DEFAULT_COMPONENTS_ALIAS,
      },
    ])

    // Create configuration using remaining options
    const config = {
      theme: options.theme,
      baseColor: options.baseColor,
      outputDir: options.outputDir,
      componentsAlias: options.componentsAlias,
      iconLibrary: options.theme === 'default' ? 'lucide-react' : 'react-icons',
      globalStylesheet,
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), config.outputDir)
    fs.mkdirSync(outputDir, { recursive: true })

    // Inject base colors into global stylesheet
    const cssVars = getThemeCssVars(config.baseColor)
    injectCssVarsSmart(config.globalStylesheet, cssVars)

    // Create json configuration file
    fs.writeFileSync(path.join(process.cwd(), 'shad-css.json'), JSON.stringify(config, null, 2))

    // Install required dependencies
    const packageManager = detectPackageManager()
    let initDep = ['classnames', 'class-variance-authority']

    // Install the correct icon library
    if (config.iconLibrary === 'lucide-react') {
      initDep.push('lucide-react')
    } else if (config.iconLibrary === 'react-icons') {
      initDep.push('@radix-ui/react-icons')
    } else {
      throw new Error('Unknown icon library.')
    }

    installDependency(initDep, packageManager)

    // Create the cn helper at lib/utils.ts
    const baseDir = srcDir || '.'
    const cnHelperPath = path.join(process.cwd(), baseDir, 'lib', 'utils.ts')
    createCnHelper(cnHelperPath)

    console.log('\n✅ Initialization complete!')

    return config
  } catch (error) {
    console.error('Error during initialization:', error)
    process.exit(1)
  }
}
