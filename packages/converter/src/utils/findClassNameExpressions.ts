import ts from 'typescript'
import { extractClassNamesFromExpression } from './extractClassNamesFromExpression'
import { formatKey } from './formatters'
import { normalizeHint } from './helpers'

export interface ClassNameUsage {
  class: string
  hint: string
}

/**
 * Analyzes a TypeScript/TSX source file to extract className expressions and their context.
 *
 * This function performs a depth-first traversal of the AST to:
 * 1. Identify component declarations and their root elements
 * 2. Track nested JSX elements and their tag names
 * 3. Extract className attributes and their values
 * 4. Generate context-aware class name mappings
 *
 * @param sourceFile The TypeScript source file to analyze for className expressions.
 * @returns A record where keys are formatted component names with hints,
 * and values are arrays of ClassNameUsage objects containing class names and hints.
 */
export function findClassNameExpressions(
  sourceFile: ts.SourceFile
): Record<string, ClassNameUsage[]> {
  const result: Record<string, ClassNameUsage[]> = {}

  // State variables for component and tag tracking
  // - currentComponentName: Tracks the name of the current component being processed
  // - rootTagName: Stores the root tag name for the current component
  // - rootAssigned: Tracks which components have had their root tag assigned
  let currentComponentName: string | null = null
  let rootTagName: string | null = null
  const rootAssigned: Record<string, boolean> = {}

  function visit(node: ts.Node, parentTagName: string | null = null) {
    // Handle component declarations
    // - Resets component tracking for new components
    // - Resets root tag tracking for new components
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1 &&
      ts.isIdentifier(node.declarationList.declarations[0].name)
    ) {
      currentComponentName = node.declarationList.declarations[0].name.text
      rootTagName = null // reset root tag tracking for new component
    }

    // Track root JSX element
    // - Identifies the first JSX element in a component
    // - Used to determine if subsequent elements are root or nested
    if (!rootTagName && (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))) {
      rootTagName = node.tagName.getText()
    }

    // Track nested JSX elements
    // - Updates parent tag name for nested elements
    // - Used to generate context-aware class name hints
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      parentTagName = node.tagName.getText()
    }

    // Process className attributes
    // - Extracts class names from both string literals and expressions
    // - Generates context-aware hints for nested elements
    // - Builds a mapping of component names to their class usages
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.escapedText === 'className'
    ) {
      // Generate context key
      const component = currentComponentName ?? 'component'
      const tagName = parentTagName ?? 'root'
      const isRoot = !rootAssigned[component] && tagName === rootTagName

      // Generate hint for nested elements
      let hint: string | null = null
      if (!isRoot) {
        hint = normalizeHint(tagName)
      }

      // Format the context key
      const key = formatKey(component, hint)

      // Track root element assignment
      if (isRoot) rootAssigned[component] = true

      // Initialize or retrieve existing usages
      const usages = result[key] || []

      // Extract class names from the initializer
      const initializer = node.initializer
      if (initializer && ts.isStringLiteral(initializer)) {
        // Handle string literal class names
        usages.push({ class: initializer.text, hint: hint ?? '' })
      } else if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
        // Handle dynamic class expressions
        const extracted = extractClassNamesFromExpression(initializer.expression)
        for (const classString of extracted) {
          usages.push({ class: classString, hint: hint ?? '' })
        }
      }

      // Store the usages for this context
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
