import { TAILWIND_DEFAULT_VARS } from '@/lib/constants'
import postcss from 'postcss'

/**
 * Cleans up Tailwind CSS custom properties (variables) by expanding them to their final values.
 * It replaces `var(--tw-*)` declarations with their actual values, removes the original `--tw-*` declarations,
 * and handles nested variables up to a certain depth to avoid infinite loops.
 *
 * @param css - The CSS string to process.
 * @returns A Promise that resolves to the cleaned CSS string with Tailwind CSS variables expanded.
 */
export async function cleanTailwindVars(css: string): Promise<string> {
  const root = postcss.parse(css)

  root.walkRules((rule) => {
    // Collect all --tw-* vars for this rule
    const localVars: Record<string, string> = {}
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        localVars[decl.prop] = decl.value.trim()
      }
    })

    // Replace vars in all decls, recursively
    rule.walkDecls((decl) => {
      decl.value = decl.value.replace(/var\((--tw-[\w-]+)\)/g, (_, varName) =>
        expandVarValue(varName, localVars)
      )
      // Also handle fallbacks: var(--tw-foo, fallback)
      decl.value = decl.value.replace(
        /var\((--tw-[\w-]+),\s*([^)]+)\)/g,
        (_, varName, fallback) => {
          const expanded = expandVarValue(varName, localVars)
          return expanded.startsWith('var(') ? fallback.trim() : expanded
        }
      )
    })

    // Remove --tw-* declarations
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        decl.remove()
      }
    })
  })

  return root.toString()
}

/**
 * Recursively expands Tailwind CSS custom properties (variables) to their final values.
 * Handles nested variables up to a maximum depth to prevent infinite loops.
 *
 * @param varName - The name of the variable to expand (e.g., '--tw-translate-x').
 * @param localVars - An object containing local variable definitions for the current rule.
 * @param depth - The current recursion depth (used to prevent infinite loops).
 * @returns The expanded value of the variable, or a fallback if not defined.
 */
function expandVarValue(varName: string, localVars: Record<string, string>, depth = 0): string {
  if (depth > 10) return `var(${varName})`

  const value = localVars[varName]

  if (value !== undefined && value !== '') {
    return value.replace(/var\((--tw-[\w-]+)\)/g, (_, innerVar) =>
      expandVarValue(innerVar, localVars, depth + 1)
    )
  }
  // Fallback to Tailwind defaults, or keep as-is
  return TAILWIND_DEFAULT_VARS[varName] ?? `var(${varName})`
}
