import { FORBIDDEN_APPLY_UTILITIES } from '@/lib/constants'

/**
 * Normalizes a tag name to a hint string.
 * This function processes the tag name by removing the "Icon" suffix, stripping non-alphanumeric characters,
 * and converting the first character to lowercase. If the tag name is null, it returns 'root'.
 *
 * @param tagName - The tag name to normalize, can be null.
 * @returns A normalized hint string.
 */
export function normalizeHint(tagName: string | null): string {
  if (!tagName) return 'root'

  const raw = tagName.split('.').pop() ?? 'root'

  return raw
    .replace(/Icon$/, '') // Remove Icon suffix
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[A-Z]/, (m) => m.toLowerCase())
}

/**
 * Converts a string to camelCase.
 *
 * @param str - The string to convert to camelCase.
 * @returns A camelCase version of the input string.
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^./, (chr) => chr.toLowerCase())
}

/**
 * Converts a string to PascalCase.
 * This function first converts the string to camelCase and then capitalizes the first character.
 *
 * @param str - The string to convert to PascalCase.
 * @returns A PascalCase version of the input string.
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str)

  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Normalizes PostCSS output by collapsing multiple newlines into a single newline.
 * This is useful for cleaning up the output of PostCSS processing.
 *
 * @param css - The CSS string to normalize.
 * @returns A normalized CSS string with collapsed newlines.
 */
export function normalizePostCssOutput(css: string): string {
  // Collapse multiple newlines into one
  return css.replace(/\n{2,}/g, '\n')
}

/**
 * Removes forbidden `@apply` utilities from a class list.
 * This function filters out any classes that are considered forbidden for `@apply` usage,
 * logging a warning for each removed class.
 *
 * @param classList - A string containing class names separated by spaces.
 * @returns A string with the forbidden classes removed.
 */
export function removeForbiddenApplyUtils(classList: string): string {
  const classes = classList.split(/\s+/)
  const filtered = classes.filter((cls) => !FORBIDDEN_APPLY_UTILITIES.includes(cls))
  const removed = classes.filter((cls) => FORBIDDEN_APPLY_UTILITIES.includes(cls))

  if (removed.length > 0) {
    console.warn(`[shad-css] Skipping @apply for: ${removed.join(', ')}`)
  }

  return filtered.join(' ')
}
