import fs from 'node:fs'
import { fileURLToPath } from 'url'
import path from 'path'
import prettier from 'prettier'
import { BASE_CSS_STYLES, BASE_SASS_STYLES, SHAD_SASS_HELPERS } from '@/lib/contants'
import { ShadCssConfig } from '@/types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function injectThemeStyles(config: ShadCssConfig, addSassHelpers: boolean = false) {
  const themePath = path.join(__dirname, '../data/themes', `${config.baseColor}.json`)
  if (!fs.existsSync(themePath)) {
    throw new Error(`Theme file not found: ${themePath}`)
  }

  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'))
  const cssVars = formatCssVarsForGlobalStylesheet(theme.cssVars, addSassHelpers)

  const original = fs.readFileSync(config.globalStylesheet, 'utf8')
  const lines = original.split('\n')
  let insertIndex = 0

  // Find the last @import or @font-face/comment/blank at the top
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (
      line.startsWith('@import') ||
      line.startsWith('@font-face') ||
      line.startsWith('/*') ||
      line.startsWith('//') ||
      line === ''
    ) {
      insertIndex = i + 1
    } else {
      break
    }
  }

  // Insert cssVars after the last import/font-face/comment/blank
  const newLines = [...lines.slice(0, insertIndex), cssVars, ...lines.slice(insertIndex)]
  const formattedCss = await prettier.format(newLines.join('\n'), {
    parser: config.moduleStyleType === 'scss' ? 'scss' : 'css',
  })

  fs.writeFileSync(config.globalStylesheet, formattedCss)

  // If they want sass helpers, create the _shad-helpers.scss file in the right place
  if (addSassHelpers) {
    // Decide where to create the /scss/ folder
    // Prefer /src/scss/ if /src exists, otherwise ./scss/
    let scssFolder: string
    if (fs.existsSync('src') && fs.lstatSync('src').isDirectory()) {
      scssFolder = path.join('src', 'scss')
    } else {
      scssFolder = path.join(process.cwd(), 'scss')
    }
    // Ensure the folder exists
    fs.mkdirSync(scssFolder, { recursive: true })

    const helpersPath = path.join(scssFolder, '_shad-helpers.scss')
    // Only write if it doesn't already exist
    if (!fs.existsSync(helpersPath)) {
      fs.writeFileSync(helpersPath, SHAD_SASS_HELPERS)
    }
  }
}

// Utility to format the theme JSON into CSS variable blocks
export function formatCssVarsForGlobalStylesheet(
  cssVars: Record<string, Record<string, string>>,
  addSassHelpers: boolean = false
): string {
  const formatVars = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')

  return [
    addSassHelpers
      ? `@use '../scss/shad-helpers' as *;
    `
      : '',
    ':root {',
    formatVars(cssVars.light),
    '--radius: 0.5rem;',
    '}',
    '.dark {',
    formatVars(cssVars.dark),
    '}',
    '',
    addSassHelpers ? BASE_SASS_STYLES : BASE_CSS_STYLES,
  ].join('\n')
}
