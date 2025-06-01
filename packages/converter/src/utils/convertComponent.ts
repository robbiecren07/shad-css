import ts from 'typescript'
import { findCvaExpressions } from './findCvaExpressions'
import { findClassNameExpressions } from './findClassNameExpressions'
import { tailwindToCss } from './tailwindToCss'
import { transformCvaVariants } from './transforms/transformCvaVariants'
import { transformClassNames } from './transforms/transformClassNames'
import { formatClassName } from './formatters'
import { injectStylesImport } from './injectStylesImport'
import { capitalize, removeForbiddenApplyUtils, toCamelCase } from './helpers'
import { EXCLUDE_STYLESHEET_INJECTION, FORBIDDEN_CLASS_NAMES } from '@/lib/constants'

/**
 * Converts a React component from inline Tailwind classes to CSS Modules format.
 *
 * This function performs a multi-step transformation:
 * 1. Creates a TypeScript source file from the TSX content
 * 2. Extracts all class name expressions from the component
 * 3. Generates CSS module styles for each class name
 * 4. Transforms the AST to replace class names with CSS module references
 * 5. Injects the CSS module import into the transformed TSX
 *
 * @param componentName The name of the component, used for generating CSS class names and file names.
 * @param tsxContent The content of the TSX file as a string, which contains JSX elements and class names.
 * @returns A Promise that resolves to an object containing:
 * - `tsx`: The transformed TSX content with class names replaced by CSS module imports.
 * - `css`: The compiled CSS content as a string, containing the styles for the component.
 */
export async function convertComponent(
  componentName: string,
  tsxContent: string
): Promise<{ tsx: string; css: string }> {
  const sourceFile = ts.createSourceFile(
    `${componentName}.tsx`,
    tsxContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const cvaBlocks = findCvaExpressions(sourceFile)

  const cssSnippets: string[] = []
  const classReplacementMap: Record<string, string> = {}

  // Step 1: Handle class-variance-authority (cva) blocks
  // This extracts cva calls and prepares CSS class names based on the component name.
  // E.g. buttonBase, buttonDestructive, buttonOutline, etc.
  if (cvaBlocks.length > 0) {
    for (const cva of cvaBlocks) {
      // Handle base class
      const baseClassName = toCamelCase(`${componentName.toLowerCase()}Base`)
      const safeBase = removeForbiddenApplyUtils(cva.baseClassName)
      cssSnippets.push(`.${baseClassName} {\n  @apply ${safeBase};\n}`)
      classReplacementMap[cva.baseClassName] = `styles.${baseClassName}`

      // Handle each variant
      for (const variantKey in cva.variants) {
        for (const variantValue in cva.variants[variantKey]) {
          const tailwindString = cva.variants[variantKey][variantValue]
          const safeVariant = removeForbiddenApplyUtils(tailwindString)
          const cssClass = toCamelCase(`${componentName}${capitalize(variantValue)}`)
          cssSnippets.push(`.${cssClass} {\n  @apply ${safeVariant};\n}`)
          classReplacementMap[tailwindString] = `styles.${cssClass}`
        }
      }

      // --- Optionally: Replace the original cva call in tsxContent ---
      // Do a string replace, or manipulate AST directly to rewrite:
      //   cva("...", { variants: ... }) -> cva(styles.buttonBase, { variants: { ... } })
      //   ...with styles.buttonDestructive, etc
      // You can use ts.transform or a regex/string replace if you prefer for now.
    }
  }

  // Step 2: Extract class names from the component
  // This creates a map of display names to their class name usages
  const classMap = findClassNameExpressions(sourceFile)

  // Step 3: Generate CSS module styles and replacement map
  // - cssSnippets: Array of CSS rules for each class
  // - classReplacementMap: Map of original class names to CSS module references

  // Create a map of class names to their usages
  for (const [displayName, usages] of Object.entries(classMap)) {
    for (const { class: className, hint } of usages) {
      // Skip empty or forbidden class names
      if (!className || FORBIDDEN_CLASS_NAMES.includes(className)) continue

      // Normalize the hint to ensure consistent formatting
      const cssKey = formatClassName(displayName, hint)

      if (!classReplacementMap[className]) {
        // Remove any forbidden @apply utils (optional extra filtering)
        const safeClassName = removeForbiddenApplyUtils(className)

        // Only output if still safe (in case removeForbiddenApplyUtils returns empty)
        if (!safeClassName) continue

        // Build CSS snippet
        cssSnippets.push(`.${cssKey} {\n  @apply ${safeClassName};\n}`)
        classReplacementMap[className] = `styles.${cssKey}`
      }
    }
  }

  // Step 4: Clean and compile CSS
  // - Join CSS snippets into a single string
  // - Process Tailwind variables and utilities
  const rawCss = cssSnippets.join('\n\n')
  const compiledCss = await tailwindToCss(rawCss)

  // Step 5: Create AST transformer for className + cva replacements
  // - Set up TypeScript printer for generating transformed code
  // - Define transformer to replace class names with CSS module references
  const printer = ts.createPrinter()

  const transforms = [
    transformClassNames(classReplacementMap), // For JSX className replacements
    transformCvaVariants(componentName), // For cva() to styles.xxx
  ]

  // Apply the transformations to the source file
  let transformed: ts.SourceFile = sourceFile
  for (const t of transforms) {
    transformed = ts.transform(transformed, [t]).transformed[0] as ts.SourceFile
  }

  // Generate the transformed TSX content
  const transformedTsx = printer.printFile(transformed as ts.SourceFile)

  // Step 6: Inject CSS module import
  // - Add import statement for the generated CSS module
  // - Place import at the bottom of the existing import list
  let finalTsx = transformedTsx

  // If the component is not in the EXCLUDE_STYLESHEET_INJECTION list,
  // inject the CSS module import statement
  if (!EXCLUDE_STYLESHEET_INJECTION.includes(componentName)) {
    finalTsx = injectStylesImport(
      transformedTsx,
      `./${componentName}.module.css`,
      `${componentName}.tsx`,
      componentName
    )
  }

  return {
    tsx: finalTsx,
    css: compiledCss,
  }
}
