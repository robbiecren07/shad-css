/**
 * Capitalizes the first character of a string.
 *
 * @param str A string to capitalize the first letter of.
 * @returns A new string with the first letter capitalized.
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
