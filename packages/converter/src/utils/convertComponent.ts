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
 * Converts a React component from inline Tailwind classes and CVA usage to CSS Modules format.
 *
 * Steps:
 * 1. Parse the TSX content to a TypeScript source file.
 * 2. Extract CVA (class-variance-authority) blocks and prepare base/variant class mappings and CSS.
 * 3. Optionally: Replace the original cva() call with CSS module references (see note in code).
 * 4. Extract className usages from JSX, generating CSS module rules and mapping each to styles.xxx.
 * 5. Compile the CSS using Tailwind.
 * 6. Transform the TypeScript AST to replace class names and CVA references.
 * 7. Inject the CSS module import into the final TSX.
 *
 * @param componentName - Name of the component (used for class/file names)
 * @param tsxContent - Raw TSX string of the component
 * @returns Promise with the transformed TSX content and compiled CSS string
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

  // Handle class-variance-authority (cva) blocks:
  //   - Generate base and variant CSS classes
  //   - Build replacement map for use in AST transforms
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

  // Extract class names from JSX and add to CSS + replacement map.
  const classMap = findClassNameExpressions(sourceFile)

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

  // Compile CSS with Tailwind utilities.
  const rawCss = cssSnippets.join('\n\n')
  const compiledCss = await tailwindToCss(componentName, rawCss)

  // Transform TSX: replace className values and cva() references.
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

  // Inject CSS module import, unless excluded for this component.
  let finalTsx = transformedTsx
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
