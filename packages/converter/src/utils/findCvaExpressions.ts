import type { CvaCallInfo } from '@/types'
import ts from 'typescript'

/**
 * Scans a TypeScript source file and finds all variable declarations
 * that are initialized with a `cva()` call (standard class-variance-authority usage).
 *
 * Example (target):
 *   const buttonVariants = cva("base", {
 *     variants: { variant: { default: "foo", destructive: "bar" } }
 *   });
 *
 * For each found call, extracts:
 *   - The variable name
 *   - The base class name (string argument to cva)
 *   - All variant keys and their possible string values
 *   - The AST node of the cva call (for possible future transforms)
 *
 * Limitations: Only supports standard cva usage and direct variable assignment.
 *
 * @param sourceFile TypeScript AST for the component file
 * @returns Array of CvaCallInfo objects describing each cva() call found
 */
export function findCvaExpressions(sourceFile: ts.SourceFile): CvaCallInfo[] {
  const cvaCalls: CvaCallInfo[] = []

  function visit(node: ts.Node) {
    // Look for: const X = cva(...)
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText() === 'cva'
    ) {
      // cva's first argument (base class string) and second argument (options object)
      const [baseClassNode, optionsNode] = node.initializer.arguments

      // Default: empty base class
      let baseClassName = ''
      if (baseClassNode && ts.isStringLiteral(baseClassNode)) {
        baseClassName = baseClassNode.text
      }

      // Extract all variant types/values, e.g. { variant: { default: "...", ... }, size: ... }
      const variants: CvaCallInfo['variants'] = {}

      if (optionsNode && ts.isObjectLiteralExpression(optionsNode)) {
        for (const prop of optionsNode.properties) {
          // Only process the 'variants' property: variants: { ... }
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name.getText() === 'variants' &&
            ts.isObjectLiteralExpression(prop.initializer)
          ) {
            // For each variant type (e.g., 'variant', 'size')
            for (const v of prop.initializer.properties) {
              if (
                ts.isPropertyAssignment(v) &&
                ts.isIdentifier(v.name) &&
                ts.isObjectLiteralExpression(v.initializer)
              ) {
                const variantKey = v.name.text
                variants[variantKey] = {}
                // For each variant value (e.g., 'default', 'destructive')
                for (const val of v.initializer.properties) {
                  if (
                    ts.isPropertyAssignment(val) &&
                    ts.isIdentifier(val.name) &&
                    ts.isStringLiteral(val.initializer)
                  ) {
                    // Save the string for this variant value
                    variants[variantKey][val.name.text] = val.initializer.text
                  }
                }
              }
            }
          }
        }
      }

      // Record the found cva() call and all its details
      cvaCalls.push({
        variableName: (node.name as ts.Identifier).text,
        baseClassName,
        variants,
        node: node.initializer as ts.CallExpression,
      })
    }
    // Recursively visit child nodes
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return cvaCalls
}
