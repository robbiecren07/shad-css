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

/**
 * Converts a Shadcn component to CSS Module format and generates three output files:
 * - TypeScript component file (index.tsx)
 * - CSS module file ([componentName].module.css)
 * - JSON metadata file ([componentName].json)
 *
 * @param componentName - The name of the component to convert (e.g. "Button")
 * @param style - The theme style to convert to (e.g. "default", "new-york")
 */
async function convert(componentName: string, style: string) {
  try {
    // Read components data from JSON file
    const componentsPath = path.join(
      __dirname,
      '.',
      'data',
      'shadcn',
      'styles',
      style,
      `${componentName}.json`
    )

    // Check if component JSON exists and throw error if not found
    if (!fs.existsSync(componentsPath)) {
      throw new Error(`Component JSON not found for style '${style}': ${componentsPath}`)
    }

    // Parse component data from JSON file
    const componentData: ComponentData = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'))

    // Create output directory
    const outputDir = path.join(__dirname, '.', 'components', style)
    fs.mkdirSync(outputDir, { recursive: true })

    // Create component directory
    const componentDir = path.join(outputDir, componentName)
    fs.mkdirSync(componentDir, { recursive: true })

    console.log(`Processing component: ${componentName}`)

    // Find the TypeScript file in the files array
    const tsFile = componentData.files.find((file) => file.name.endsWith('.tsx'))
    if (!tsFile) {
      throw new Error(`No TypeScript file found in component data for ${componentName}`)
    }

    // Convert the component
    const { tsx, css } = await convertComponent(componentName, tsFile.content)

    // build TypeScript path
    const tsPath = path.join(componentDir, 'index.tsx')
    // format & lint TypeScript file
    const formattedTsx = await formatAndLint(tsPath, tsx)
    // Write TypeScript file
    fs.writeFileSync(tsPath, formattedTsx)

    // build CSS path
    const cssPath = path.join(componentDir, `${componentName}.module.css`)
    // format CSS file with Prettier
    const formattedCss = await prettier.format(css, {
      parser: 'css',
    })
    // Write CSS file
    fs.writeFileSync(cssPath, formattedCss)

    // build JSON path
    const jsonPath = path.join(componentDir, `${componentName}.json`)
    // Create JSON file
    const jsonContent = await createJsonFile(
      componentName,
      componentData.dependencies,
      componentData.registryDependencies,
      formattedTsx,
      formattedCss
    )
    // Write JSON file
    fs.writeFileSync(jsonPath, jsonContent.json)

    console.log('✅ Conversion complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Script entry point - handles command line arguments and executes conversion
if (import.meta.url === `file://${process.argv[1]}`) {
  const [componentName, style] = process.argv.slice(2)
  if (!componentName || !style) {
    console.error('Usage: tsx convertJson.ts <component-name> <style>')
    process.exit(1)
  }

  convert(componentName, style)
}
