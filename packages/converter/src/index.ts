/**
 * shad-css Component Converter Tool
 *
 * Converts Shadcn component JSON definitions (with embedded Tailwind classes)
 * into CSS Module-based React components.
 *
 * Usage:
 *   tsx convertJson.ts <component-name|all> <style>
 *
 *   Examples:
 *     tsx convertJson.ts Button new-york
 *     tsx convertJson.ts all default
 *     tsx convertJson.ts --all new-york
 *
 * Input:
 *   - Component JSON files should be placed in:
 *       ./data/shadcn/styles/<style>/<ComponentName>.json
 *
 * Output:
 *   - Converted files are written to:
 *       ./components/<style>/<ComponentName>/
 *     This includes:
 *       - index.tsx                   (React component)
 *       - <component-name>.module.css  (CSS module)
 *       - <component-name>.json        (Metadata and code snapshot)
 *
 * Features:
 *   - Converts a single component or all components for a given style.
 *   - Logs conversion progress and errors.
 *   - Formats and lints generated code.
 */

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
 * Converts a single Shadcn component JSON file to a CSS Modules-based React component.
 *
 * @param {string} componentName - The name of the component (e.g., 'Button')
 * @param {string} style - The style/theme to use (corresponds to a folder name)
 */
async function convert(componentName: string, style: string) {
  try {
    // Path to the component's JSON definition
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

    // Load and parse the component definition
    const componentData: ComponentData = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'))

    // Prepare output directories
    const outputDir = path.join(__dirname, '.', 'components', style)
    fs.mkdirSync(outputDir, { recursive: true })
    const componentDir = path.join(outputDir, componentName)
    fs.mkdirSync(componentDir, { recursive: true })

    console.log(`Processing component: ${componentName}`)

    // Find the .tsx file in the JSON's files array
    const tsFile = componentData.files.find((file) => file.name.endsWith('.tsx'))
    if (!tsFile) throw new Error(`No TypeScript file found in component data for ${componentName}`)

    // Convert the component using the converter utility
    const { tsx, css } = await convertComponent(componentName, tsFile.content)

    // Write the formatted TypeScript file
    const tsPath = path.join(componentDir, 'index.tsx')
    const formattedTsx = await formatAndLint(tsPath, tsx)
    fs.writeFileSync(tsPath, formattedTsx)

    // Write the formatted CSS Module file
    const cssPath = path.join(componentDir, `${componentName}.module.css`)
    const formattedCss = await prettier.format(css, { parser: 'css' })
    fs.writeFileSync(cssPath, formattedCss)

    // Write the JSON metadata/code snapshot
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

/**
 * Converts **all** Shadcn components found in a given style directory.
 *
 * @param {string} style - The style/theme name (corresponds to a folder name)
 */
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

// ---------------------
// Script Entry Point
// ---------------------
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
