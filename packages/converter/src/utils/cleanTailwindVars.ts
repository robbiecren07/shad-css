import { TAILWIND_DEFAULT_VARS } from '@/lib/constants'
import postcss from 'postcss'

/**
 * Cleans up Tailwind CSS custom properties by expanding them to their final values.
 *
 * This function:
 * 1. Parses the CSS input using PostCSS
 * 2. For each rule:
 *    - Collects all --tw-* custom properties
 *    - Replaces var(--tw-*) references with actual values
 *    - Handles var(--tw-*, fallback) with fallback values
 *    - Removes the original --tw-* declarations
 * 3. Returns the cleaned CSS string
 *
 * @param css The CSS string to process.
 * @returns A Promise that resolves to the cleaned CSS string with Tailwind CSS variables expanded.
 */
export async function cleanTailwindVars(css: string): Promise<string> {
  const root = postcss.parse(css)

  // Process each CSS rule
  root.walkRules((rule) => {
    // Collect all Tailwind custom properties for this rule
    const localVars: Record<string, string> = {}
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        localVars[decl.prop] = decl.value.trim()
      }
    })

    // Replace Tailwind variables in declarations
    rule.walkDecls((decl) => {
      // Replace direct var(--tw-*) references
      decl.value = decl.value.replace(/var\((--tw-[\w-]+)\)/g, (_, varName) =>
        expandVarValue(varName, localVars)
      )

      // Handle var(--tw-*, fallback) with fallback values
      decl.value = decl.value.replace(
        /var\((--tw-[\w-]+),\s*([^)]+)\)/g,
        (_, varName, fallback) => {
          const expanded = expandVarValue(varName, localVars)
          return expanded.startsWith('var(') ? fallback.trim() : expanded
        }
      )
    })

    // Clean up by removing original Tailwind custom properties
    rule.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        decl.remove()
      }
    })
  })

  return root.toString()
}

/**
 * Recursively expands Tailwind CSS custom properties to their final values.
 *
 * This function:
 * 1. Looks up the variable value in local scope
 * 2. Recursively expands nested var() references
 * 3. Falls back to Tailwind defaults if not found
 * 4. Prevents infinite recursion by limiting depth
 *
 * @param varName The name of the variable to expand (e.g., '--tw-translate-x').
 * @param localVars An object containing local variable definitions for the current rule.
 * @param depth The current recursion depth (used to prevent infinite loops).
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
