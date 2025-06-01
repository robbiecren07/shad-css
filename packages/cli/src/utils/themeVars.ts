import fs from 'node:fs'
import { fileURLToPath } from 'url'
import path from 'path'
import prettier from 'prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function injectCssVarsSmart(cssFilePath: string, cssVars: string) {
  const original = fs.readFileSync(cssFilePath, 'utf8')
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
    parser: 'css',
  })

  fs.writeFileSync(cssFilePath, formattedCss)
}

// Utility to format the theme JSON into CSS variable blocks
export function formatCssVarsForGlobalStylesheet(
  cssVars: Record<string, Record<string, string>>
): string {
  const formatVars = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')

  return [
    ':root {',
    formatVars(cssVars.light),
    '--radius: 0.5rem;',
    '}',
    '.dark {',
    formatVars(cssVars.dark),
    '}',
    '',
  ].join('\n')
}

// Only returns the CSS string!
export function getThemeCssVars(baseColor: string): string {
  const themePath = path.join(__dirname, '../data/themes', `${baseColor}.json`)
  if (!fs.existsSync(themePath)) {
    throw new Error(`Theme file not found: ${themePath}`)
  }
  const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'))
  return formatCssVarsForGlobalStylesheet(theme.cssVars)
}
