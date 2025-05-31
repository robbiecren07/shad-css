import type { CvaCallInfo } from '@/types'
import ts from 'typescript'

// Very simple cva() call parser (not bulletproof, but works for std cva usage)
export function findCvaExpressions(sourceFile: ts.SourceFile): CvaCallInfo[] {
  const cvaCalls: CvaCallInfo[] = []

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText() === 'cva'
    ) {
      const [baseClassNode, optionsNode] = node.initializer.arguments
      let baseClassName = ''
      if (baseClassNode && ts.isStringLiteral(baseClassNode)) {
        baseClassName = baseClassNode.text
      }

      const variants: CvaCallInfo['variants'] = {}

      // Handle variants in cva({...}, {variants: {...}})
      if (optionsNode && ts.isObjectLiteralExpression(optionsNode)) {
        for (const prop of optionsNode.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name.getText() === 'variants' &&
            ts.isObjectLiteralExpression(prop.initializer)
          ) {
            for (const v of prop.initializer.properties) {
              if (
                ts.isPropertyAssignment(v) &&
                ts.isIdentifier(v.name) &&
                ts.isObjectLiteralExpression(v.initializer)
              ) {
                const variantKey = v.name.text
                variants[variantKey] = {}
                for (const val of v.initializer.properties) {
                  if (
                    ts.isPropertyAssignment(val) &&
                    ts.isIdentifier(val.name) &&
                    ts.isStringLiteral(val.initializer)
                  ) {
                    variants[variantKey][val.name.text] = val.initializer.text
                  }
                }
              }
            }
          }
        }
      }

      cvaCalls.push({
        variableName: (node.name as ts.Identifier).text,
        baseClassName,
        variants,
        node: node.initializer as ts.CallExpression,
      })
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return cvaCalls
}
