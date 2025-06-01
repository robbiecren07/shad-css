import { FORBIDDEN_CLASS_NAMES } from '@/lib/constants'

/**
 * Normalizes a component tag name to a semantic hint string.
 *
 * This function:
 * 1. Handles component references:
 *    - For nested components (e.g., "CommandPrimitive.Input"), extracts the final segment ("Input")
 *    - For primitive tags (e.g., "div"), converts to PascalCase ("Div")
 * 2. Removes the "Icon" suffix if present
 * 3. Returns the normalized hint string
 *
 * @param tag The component tag name to normalize.
 * @returns A normalized hint string suitable for class name generation.
 */
export function normalizeHint(tag: string): string {
  let out: string
  if (tag.includes('.')) {
    // Extract final segment for nested components
    out = tag.split('.').pop()!
  } else {
    // Convert primitive tags to PascalCase
    out = tag.charAt(0).toUpperCase() + tag.slice(1)
  }
  // Remove trailing 'Icon' suffix
  return out.replace(/Icon$/, '')
}

/**
 * Converts a string to camelCase format.
 *
 * This function:
 * 1. Splits the string by non-alphanumeric characters
 * 2. Converts each segment to uppercase except the first one
 * 3. Joins segments back together
 * 4. Converts the first character to lowercase
 *
 * @param str The string to convert to camelCase.
 * @returns A camelCase version of the input string.
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^./, (chr) => chr.toLowerCase())
}

/**
 * Converts a string to PascalCase format.
 *
 * This function:
 * 1. Converts the string to camelCase
 * 2. Capitalizes the first character
 * 3. Returns the resulting PascalCase string
 *
 * @param str The string to convert to PascalCase.
 * @returns A PascalCase version of the input string.
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str)

  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Cleans up PostCSS output by normalizing newlines.
 *
 * This function:
 * 1. Takes a CSS string with potentially multiple newlines
 * 2. Collapses consecutive newlines into a single newline
 * 3. Returns the cleaned CSS string
 *
 * @param css The CSS string to normalize.
 * @returns A normalized CSS string with collapsed newlines.
 */
export function normalizePostCssOutput(css: string): string {
  // Collapse multiple newlines into one
  return css.replace(/\n{2,}/g, '\n')
}

/**
 * Filters out forbidden Tailwind `@apply` utilities from a class list.
 *
 * This function:
 * 1. Splits the input class list into individual classes
 * 2. Filters out any classes that are in the forbidden list
 * 3. Logs a warning for each removed forbidden class
 * 4. Returns the cleaned class list
 *
 * @param classList A string containing class names separated by spaces.
 * @returns A string with the forbidden classes removed.
 */
export function removeForbiddenApplyUtils(classList: string): string {
  const classes = classList.split(/\s+/)
  const filtered = classes.filter((cls) => !FORBIDDEN_CLASS_NAMES.includes(cls))
  const removed = classes.filter((cls) => FORBIDDEN_CLASS_NAMES.includes(cls))

  if (removed.length > 0) {
    console.warn(`[shad-css] Skipping @apply for: ${removed.join(', ')}`)
  }

  return filtered.join(' ')
}

/**
 * Capitalizes the first character of a string.
 *
 * @param str A string to capitalize the first letter of.
 * @returns A new string with the first letter capitalized.
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
