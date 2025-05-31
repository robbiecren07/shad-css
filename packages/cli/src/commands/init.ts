import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import prompts from 'prompts'

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
    const DEFAULT_OUTPUT_DIR = `${srcDir ? 'src/' : ''}components/shad-css`
    const DEFAULT_COMPONENTS_ALIAS = '@/*'

    // Ask questions
    const options = await prompts([
      {
        type: 'toggle',
        name: 'typescript',
        message: 'Would you like to use TypeScript (recommended)?',
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
    ])

    // Exit if TypeScript is not selected
    if (!options.typescript) {
      console.log('\nℹ️ shad-css currently only supports TypeScript projects.')
      console.log('Please run this command in a TypeScript project.')
      process.exit(0)
    }

    // Ask remaining questions
    const remainingOptions = await prompts([
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
      theme: remainingOptions.theme,
      baseColor: remainingOptions.baseColor,
      outputDir: remainingOptions.outputDir,
      componentsAlias: remainingOptions.componentsAlias,
    }

    // Create output directory
    const outputDir = path.join(process.cwd(), remainingOptions.outputDir)
    fs.mkdirSync(outputDir, { recursive: true })

    // Create configuration file
    fs.writeFileSync(path.join(process.cwd(), 'shad-css.json'), JSON.stringify(config, null, 2))

    console.log('\nInitialization complete!')
    console.log(`Your components will be installed in: ${remainingOptions.outputDir}`)
  })
