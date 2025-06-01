import prettier from 'prettier'
import { ESLint } from 'eslint'
import { toCamelCase, toPascalCase } from './helpers'
import { basicHtmlTags } from '@/lib/constants'
import unusedImports from 'eslint-plugin-unused-imports'

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
 * Formats a component class name with optional hint.
 *
 * This function:
 * 1. Converts the component name to camelCase
 * 2. Processes the hint:
 *    - Converts to PascalCase
 *    - Appends to the base name if:
 *      - A hint is provided
 *      - The hint is not already present in the component name
 *      - The forceHint flag is true
 * 3. Returns the formatted class name
 *
 * @param componentName The base component name to format.
 * @param hint An optional hint to append to the component name.
 * @param forceHint If true, forces the hint to be appended even if it matches the component name.
 * @returns The formatted class name string.
 */
export function formatClassName(
  componentName: string,
  hint?: string | null,
  forceHint?: boolean
): string {
  const base = toCamelCase(componentName)
  if (!hint || (!forceHint && base.endsWith(toPascalCase(hint)))) {
    return base
  }

  const normalizedHint = toPascalCase(hint)
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
      plugins: {
        'unused-imports': unusedImports,
      },
      rules: {
        semi: ['error', 'always'],
        'unused-imports/no-unused-imports': 'error',
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
