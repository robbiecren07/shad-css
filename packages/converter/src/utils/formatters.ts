import prettier from 'prettier'
import { ESLint } from 'eslint'
import { toCamelCase, toPascalCase } from './helpers'
import { basicHtmlTags } from '@/lib/constants'

/**
 * Format code using Prettier
 * This function formats the provided code string using Prettier with the specified parser.
 *
 * @param code - The code string to format
 * @param parser - The parser to use for formatting
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
 * Formats a component name and an optional hint into a class name.
 * If the hint is provided and not already included in the component name,
 * it appends the hint in PascalCase to the component name.
 * If the hint is null or empty, it returns the component name in camelCase.
 *
 * @param componentName - The name of the component to format.
 * @param hint - An optional hint to append to the component name.
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
 * Formats a component name and an optional hint into a key.
 *
 * @param componentName - The name of the component to format.
 * @param hint - An optional hint to append to the component name.
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
 * Formats and lints TypeScript/TSX code using Prettier and ESLint.
 *
 * @param tsPath - The path to the TypeScript file (used for ESLint).
 * @param tsxCode - The TSX code to format and lint.
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
