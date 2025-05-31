import ts from 'typescript'
import { extractClassNamesFromExpression } from './extractClassNamesFromExpression'
import { formatKey } from './formatters'
import { normalizeHint } from './helpers'

export interface ClassNameUsage {
  class: string
  hint: string
}

/**
 * Finds all className expressions in a TypeScript/TSX source file.
 * It analyzes the file for JSX attributes named "className" and extracts
 * the class names used, along with hints based on the component and tag name.
 *
 * @param sourceFile The TypeScript source file to analyze for className expressions.
 * @returns A record where keys are formatted component names with hints,
 * and values are arrays of ClassNameUsage objects containing class names and hints.
 */
export function findClassNameExpressions(
  sourceFile: ts.SourceFile
): Record<string, ClassNameUsage[]> {
  const result: Record<string, ClassNameUsage[]> = {}

  // Variables to track the current component and root tag name
  // These are reset for each new component found in the source file
  let currentComponentName: string | null = null
  let rootTagName: string | null = null
  const rootAssigned: Record<string, boolean> = {}

  function visit(node: ts.Node, parentTagName: string | null = null) {
    // Detect top-level component name
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1 &&
      ts.isIdentifier(node.declarationList.declarations[0].name)
    ) {
      currentComponentName = node.declarationList.declarations[0].name.text
      rootTagName = null // reset root for each new component
    }

    // Detect root JSX tag (first JSX element inside the component)
    if (!rootTagName && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      rootTagName = node.tagName.getText()
    }

    // Track nested tag names
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      parentTagName = node.tagName.getText()
    }

    // Handle className attributes
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.escapedText === 'className'
    ) {
      // Use the current component name and parent tag name to determine the key
      const component = currentComponentName ?? 'component'
      const tagName = parentTagName ?? 'root'
      const isRoot = !rootAssigned[component] && tagName === rootTagName

      let hint: string | null = null
      if (!isRoot) {
        hint = normalizeHint(tagName)
      }

      // Format the key using component name and hint
      const key = formatKey(component, hint)

      // Initialize the key in the result if it doesn't exist
      if (isRoot) rootAssigned[component] = true

      const usages = result[key] || []

      // Extract class names from the initializer
      const initializer = node.initializer
      if (initializer && ts.isStringLiteral(initializer)) {
        usages.push({ class: initializer.text, hint: hint ?? '' })
      } else if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
        // If the initializer is a JsxExpression, extract class names from its expression
        const extracted = extractClassNamesFromExpression(initializer.expression)
        for (const classString of extracted) {
          usages.push({ class: classString, hint: hint ?? '' })
        }
      }

      result[key] = usages
    }

    // Recursively visit child nodes
    ts.forEachChild(node, (child) => visit(child, parentTagName))
  }

  // Start visiting from the root of the source file
  // This will traverse the entire AST of the source file
  visit(sourceFile)

  // Return the result object containing all found className usages
  return result
}
