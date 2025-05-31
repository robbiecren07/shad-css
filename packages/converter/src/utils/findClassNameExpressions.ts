import type { ClassNameUsage, ExtractedClassName } from '@/types'
import ts from 'typescript'
import { extractClassNamesFromExpression } from './extractClassNamesFromExpression'
import { formatClassName } from './formatters'
import { normalizeHint } from './helpers'

/**
 * Extracts all unique className expressions from a TypeScript/TSX source file,
 * associating each usage with a context-aware CSS module key.
 *
 * Traversal is per-component. For each component:
 *   - The first className is treated as the "root" class for that component.
 *   - Any subsequent or nested/conditional classes get a unique, semantic key based on the component and a hint.
 *
 * @param sourceFile The TypeScript source file to analyze.
 * @returns A map: { [cssModuleKey]: ClassNameUsage[] }
 */
export function findClassNameExpressions(
  sourceFile: ts.SourceFile
): Record<string, ClassNameUsage[]> {
  const result: Record<string, ClassNameUsage[]> = {}

  // Track the currently analyzed component and the "root" className key per component.
  let currentComponentName: string | null = null
  const rootClassKey: Record<string, string> = {}

  /**
   * Depth-first AST traversal function.
   * @param node Current AST node.
   * @param parentTagName Most recent parent JSX tag name.
   */
  function visit(node: ts.Node, parentTagName: string | null = null) {
    // 1. Detect variable declarations like: const Button = ...
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1 &&
      ts.isIdentifier(node.declarationList.declarations[0].name)
    ) {
      const componentName = node.declarationList.declarations[0].name.text
      currentComponentName = componentName
      rootClassKey[componentName] = ''
    }

    // 2. Track JSX tag name for nesting context
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      parentTagName = node.tagName.getText()
    }

    // 3. Find className attributes and extract usage
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.escapedText === 'className'
    ) {
      const component = currentComponentName ?? 'component'
      const isRoot = rootClassKey[component] === ''
      let baseHint: string | null = null

      // For nested nodes, use the parent tag as the semantic hint
      if (!isRoot) {
        baseHint = normalizeHint(parentTagName ?? 'element')
      }

      const initializer = node.initializer

      // 3a. Handle static string className: className="foo"
      if (initializer && ts.isStringLiteral(initializer)) {
        const key = formatClassName(component, baseHint, isRoot ? false : true)
        if (isRoot) rootClassKey[component] = key
        const usages = result[key] || []
        usages.push({ class: initializer.text, hint: baseHint ?? '', loc: node.getStart() })
        result[key] = usages

        // 3b. Handle dynamic/expression className: className={...}
      } else if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
        const extracted: ExtractedClassName[] = extractClassNamesFromExpression(
          initializer.expression
        )
        let firstInComponent = isRoot
        for (const { class: classString, hint } of extracted) {
          // The first extracted usage in the component is the "root"; all others are nested/conditional
          const thisHint = hint ?? baseHint
          let key: string

          if (firstInComponent) {
            key = formatClassName(component, thisHint, false)
            rootClassKey[component] = key
            firstInComponent = false
          } else {
            // Always force the hint for uniqueness (e.g., for prop-based or conditional classes)
            key = formatClassName(component, thisHint, true)
          }

          const usages = result[key] || []
          usages.push({ class: classString, hint: thisHint ?? '', loc: node.getStart() })
          result[key] = usages
        }
      }
    }

    // 4. Recurse into children with current context
    ts.forEachChild(node, (child) => visit(child, parentTagName))
  }

  // Start traversal at the root of the AST
  visit(sourceFile)
  return result
}
