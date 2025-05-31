import prettier from 'prettier'
import { ESLint } from 'eslint'
import { toCamelCase, toPascalCase } from './helpers'
import { basicHtmlTags } from '@/lib/constants'

/**
 * Formats code using Prettier with consistent configuration.
 *
 * This function:
 * 1. Uses Prettier to format code with:
 *    - Single quotes
 *    - Trailing commas for all multi-line structures
 *    - Appropriate parser based on code type
 * 2. Returns the formatted code string
 *
 * @param code The code string to format
 * @param parser The parser to use for formatting ('babel' or 'css')
 * @returns The formatted code string
 */
export async function formatCode(code: string, parser: 'babel' | 'css' = 'babel') {
  return prettier.format(code, {
    parser,
    singleQuote: true,
    trailingComma: 'all',
  })
}

/**
 * Generates a CSS class name from a component name and optional hint.
 *
 * This function:
 * 1. Converts component name to camelCase
 * 2. If hint is provided:
 *    - Converts hint to PascalCase
 *    - Appends hint if not already present in component name
 * 3. Returns the formatted class name
 *
 * @param componentName The name of the component to format.
 * @param hint An optional hint to append to the component name.
 * @returns A formatted class name string.
 */
export function formatClassName(componentName: string, hint?: string | null): string {
  const base = toCamelCase(componentName)

  if (!hint) return base

  const normalizedHint = toPascalCase(hint)

  // 🚫 Avoid repeating if componentName already includes the hint
  if (base.toLowerCase().includes(hint.toLowerCase()) || base.includes(normalizedHint)) {
    return base
  }

  return `${base}${normalizedHint}`
}

/**
 * Generates a unique key for component context.
 *
 * This function:
 * 1. Converts component name to camelCase
 * 2. If hint is provided:
 *    - Converts hint to PascalCase
 *    - Appends hint if it's not:
 *      - The same as the component name
 *      - A basic HTML tag
 * 3. Returns the formatted key
 *
 * @param componentName The name of the component to format.
 * @param hint An optional hint to append to the component name.
 * @returns A formatted key string.
 */
export function formatKey(componentName: string, hint: string | null): string {
  const base = toCamelCase(componentName)

  if (!hint || hint.toLowerCase() === base.toLowerCase() || basicHtmlTags.has(hint.toLowerCase())) {
    return base
  }

  const normalizedHint = toPascalCase(hint)
  return `${base}${normalizedHint}`
}

/**
 * Formats and lints TypeScript/TSX code with consistent style rules.
 *
 * This function:
 * 1. Formats code with Prettier:
 *    - Uses TypeScript parser
 *    - Enforces semicolons
 * 2. Lints with ESLint:
 *    - Enforces semicolons
 *    - Adds padding between statements
 *    - Adds blank lines before exports and const declarations
 * 3. Returns the formatted and linted code
 *
 * @param tsPath The path to the TypeScript file (used for ESLint).
 * @param tsxCode The TSX code to format and lint.
 * @returns A Promise that resolves to the formatted and linted code.
 */
export async function formatAndLint(tsPath: string, tsxCode: string): Promise<string> {
  // Run Prettier first
  const formatted = await prettier.format(tsxCode, { parser: 'typescript', semi: true })

  // Run ESLint on the result
  const eslint = new ESLint({
    fix: true,
    overrideConfig: {
      rules: {
        semi: ['error', 'always'],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'export' },
          { blankLine: 'always', prev: '*', next: 'const' },
          { blankLine: 'always', prev: 'const', next: 'const' },
          { blankLine: 'always', prev: 'block-like', next: 'const' },
          { blankLine: 'always', prev: 'directive', next: '*' },
        ],
      },
    },
  })
  const [result] = await eslint.lintText(formatted, { filePath: tsPath })

  return result.output || formatted
}
