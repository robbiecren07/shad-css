import ts from 'typescript'
import { findClassNameExpressions } from './findClassNameExpressions'
import { tailwindToCss } from './tailwindToCss'
import { injectStylesImport } from './injectStylesImport'
import { formatClassName } from './formatters'
import { transformClassExpression } from './transforms/transformClassExpression'
import { removeForbiddenApplyUtils } from './helpers'

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

  // Step 1: Extract class names from the component
  // This creates a map of display names to their class name usages
  const classMap = findClassNameExpressions(sourceFile)

  // Step 2: Generate CSS module styles and replacement map
  // - cssSnippets: Array of CSS rules for each class
  // - classReplacementMap: Map of original class names to CSS module references
  const cssSnippets: string[] = []
  const classReplacementMap: Record<string, string> = {}

  // Create a map of class names to their usages
  for (const [displayName, usages] of Object.entries(classMap)) {
    for (const { class: className, hint } of usages) {
      // Normalize the hint to ensure consistent formatting
      const cssKey = formatClassName(displayName, hint)
      if (!classReplacementMap[className]) {
        // Remove forbidden classes
        const safeClassName = removeForbiddenApplyUtils(className)
        // Build CSS snippet
        cssSnippets.push(`.${cssKey} {\n  @apply ${safeClassName};\n}`)
        classReplacementMap[className] = `styles.${cssKey}`
      }
    }
  }

  // Step 3: Clean and compile CSS
  // - Join CSS snippets into a single string
  // - Process Tailwind variables and utilities
  const rawCss = cssSnippets.join('\n\n')
  const compiledCss = await tailwindToCss(rawCss)

  // Step 4: Create AST transformer for className replacements
  // - Set up TypeScript printer for generating transformed code
  // - Define transformer to replace class names with CSS module references
  const printer = ts.createPrinter()

  const transformer = <T extends ts.Node>(context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Look for JSXAttribute className
      if (ts.isJsxAttribute(node) && node.name.getText() === 'className' && node.initializer) {
        const init = node.initializer

        // case: className="..."
        if (ts.isStringLiteral(init)) {
          const replacement = classReplacementMap[init.text]
          if (replacement) {
            // Replace with styles object reference
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(undefined, ts.factory.createIdentifier(replacement))
            )
          }
        }

        // case: className={cn(...)} or className={...}
        if (ts.isJsxExpression(init) && init.expression) {
          const transformed = transformClassExpression(init.expression, classReplacementMap)
          // Replace with styles object reference
          return ts.factory.updateJsxAttribute(
            node,
            node.name,
            ts.factory.createJsxExpression(undefined, transformed)
          )
        }
      }

      // Recursively visit child nodes
      return ts.visitEachChild(node, visit, context)
    }

    // Return a visitor function that applies the transformation
    return (node: T) => ts.visitNode(node, visit)
  }

  // Apply AST transformation
  // - Transform the source file to replace class names with CSS module references
  // - Generate the transformed TSX code using the printer
  const result = ts.transform(sourceFile, [transformer])
  const transformedTsx = printer.printFile(result.transformed[0] as ts.SourceFile)

  // Step 5: Inject CSS module import
  // - Add import statement for the generated CSS module
  // - Place import at the bottom of the existing import list
  const finalTsx = injectStylesImport(
    transformedTsx,
    `./${componentName}.module.css`,
    `${componentName}.tsx`
  )

  return {
    tsx: finalTsx,
    css: compiledCss,
  }
}
