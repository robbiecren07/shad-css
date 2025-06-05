import type { ShadCssConfig } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import { Command } from 'commander'
import prompts from 'prompts'
import fg from 'fast-glob'
import { injectThemeStyles } from '@/utils/injectThemeStyles'
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
    let moduleStyleType: 'css' | 'scss'
    let addSassHelpers = false

    if (globalStyles.length === 1) {
      globalStylesheet = globalStyles[0]
      moduleStyleType = globalStylesheet.endsWith('.scss') ? 'scss' : 'css'

      // If existing globals is scss, prompt for helper
      if (moduleStyleType === 'scss') {
        const { wantSassHelpers } = await prompts({
          type: 'toggle',
          name: 'wantSassHelpers',
          message:
            'Would you like to add the SASS colorVar() helper function to your globals.scss?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        })
        addSassHelpers = wantSassHelpers
      }
    } else if (globalStyles.length > 1) {
      const { chosen } = await prompts({
        type: 'select',
        name: 'chosen',
        message: 'Multiple globals.{css,scss} files found. Choose one:',
        choices: globalStyles.map((file) => ({ title: file, value: file })),
      })
      globalStylesheet = chosen
      moduleStyleType = globalStylesheet.endsWith('.scss') ? 'scss' : 'css'

      if (moduleStyleType === 'scss') {
        const { wantSassHelpers } = await prompts({
          type: 'toggle',
          name: 'wantSassHelpers',
          message:
            'Would you like to add the SASS colorVar() helper function to your globals.scss?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        })
        addSassHelpers = wantSassHelpers
      }
    } else {
      // Preferred creation order
      const candidateDirs = [path.join('src', 'app'), 'app', 'src', '.']
      let globalDir = '.'

      for (const dir of candidateDirs) {
        if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
          globalDir = dir
          break
        }
      }

      // PROMPT: Which type should we create?
      const { stylesheetType } = await prompts({
        type: 'select',
        name: 'stylesheetType',
        message: 'No globals.css or globals.scss found. Which module type do you want to use?',
        choices: [
          { title: 'CSS (.css)', value: 'css' },
          { title: 'SCSS (.scss)', value: 'scss' },
        ],
        initial: 0,
      })

      moduleStyleType = stylesheetType
      const globalPath = path.join(globalDir, `globals.${moduleStyleType}`)

      let wantSassHelpers = false
      if (moduleStyleType === 'scss') {
        const res = await prompts({
          type: 'toggle',
          name: 'wantSassHelpers',
          message:
            'Would you like to add the SASS colorVar() helper function to your globals.scss?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        })
        wantSassHelpers = res.wantSassHelpers
      }
      addSassHelpers = wantSassHelpers

      const initialContent = '/* shad-css generated global stylesheet */\n'
      fs.writeFileSync(globalPath, initialContent)
      globalStylesheet = globalPath
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
    const config: ShadCssConfig = {
      theme: options.theme,
      baseColor: options.baseColor,
      outputDir: options.outputDir,
      componentsAlias: options.componentsAlias,
      iconLibrary: options.theme === 'default' ? 'lucide-react' : 'react-icons',
      globalStylesheet,
      moduleStyleType,
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), config.outputDir)
    fs.mkdirSync(outputDir, { recursive: true })

    // Inject base colors into global stylesheet
    injectThemeStyles(config, addSassHelpers)

    // Create json configuration file
    fs.writeFileSync(path.join(process.cwd(), 'shad-css.json'), JSON.stringify(config, null, 2))

    // Install required dependencies
    const packageManager = detectPackageManager()
    let initDep = [
      'classnames',
      'class-variance-authority',
      moduleStyleType === 'scss' ? 'sass' : '',
    ]

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
