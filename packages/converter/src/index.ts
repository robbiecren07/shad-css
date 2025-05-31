import type { ComponentData } from './types'
import { fileURLToPath } from 'url'
import path from 'node:path'
import fs from 'node:fs'
import { convertComponent } from '@/utils/convertComponent'
import prettier from 'prettier'
import { createJsonFile } from '@/utils/createJsonFile'
import { formatAndLint } from '@/utils/formatters'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function convert(componentName: string, style: string) {
  try {
    const componentsPath = path.join(
      __dirname,
      '.',
      'data',
      'shadcn',
      'styles',
      style,
      `${componentName}.json`
    )

    if (!fs.existsSync(componentsPath)) {
      throw new Error(`Component JSON not found for style '${style}': ${componentsPath}`)
    }

    const componentData: ComponentData = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'))

    const outputDir = path.join(__dirname, '.', 'components', style)
    fs.mkdirSync(outputDir, { recursive: true })
    const componentDir = path.join(outputDir, componentName)
    fs.mkdirSync(componentDir, { recursive: true })

    console.log(`Processing component: ${componentName}`)
    const tsFile = componentData.files.find((file) => file.name.endsWith('.tsx'))
    if (!tsFile) throw new Error(`No TypeScript file found in component data for ${componentName}`)

    const { tsx, css } = await convertComponent(componentName, tsFile.content)
    const tsPath = path.join(componentDir, 'index.tsx')
    const formattedTsx = await formatAndLint(tsPath, tsx)
    fs.writeFileSync(tsPath, formattedTsx)

    const cssPath = path.join(componentDir, `${componentName}.module.css`)
    const formattedCss = await prettier.format(css, { parser: 'css' })
    fs.writeFileSync(cssPath, formattedCss)

    const jsonPath = path.join(componentDir, `${componentName}.json`)
    const jsonContent = await createJsonFile(
      componentName,
      componentData.dependencies,
      componentData.registryDependencies,
      formattedTsx,
      formattedCss
    )
    fs.writeFileSync(jsonPath, jsonContent.json)

    console.log('✅ Conversion complete!')
  } catch (error) {
    console.error(`❌ Error processing "${componentName}":`, error)
  }
}

// New function to convert all components in a style dir
async function convertAllInStyle(style: string) {
  const dir = path.join(__dirname, '.', 'data', 'shadcn', 'styles', style)
  if (!fs.existsSync(dir)) {
    console.error(`❌ Style directory not found: ${dir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  if (!files.length) {
    console.error(`❌ No component JSON files found in style: ${style}`)
    process.exit(1)
  }
  console.log(`Converting all components for style "${style}"...`)
  for (const file of files) {
    const componentName = file.replace(/\.json$/, '')
    await convert(componentName, style) // Handles error/log per-component
  }
  console.log(`\n🎉 Finished converting all components for "${style}"`)
}

// Script entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const [componentName, style] = process.argv.slice(2)
  if (!componentName || !style) {
    console.error('Usage: tsx convertJson.ts <component-name|all> <style>')
    process.exit(1)
  }

  if (componentName === 'all' || componentName === '--all') {
    convertAllInStyle(style)
  } else {
    convert(componentName, style)
  }
}
