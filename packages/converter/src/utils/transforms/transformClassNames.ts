import ts from 'typescript'
import { transformClassExpression } from './transformClassExpression'

/**
 * Returns a TypeScript AST transformer that replaces className string/className utility calls
 * with CSS module references using the provided classReplacementMap.
 */
export function transformClassNames(classReplacementMap: Record<string, string>) {
  return <T extends ts.Node>(context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Find JSXAttribute className
      if (ts.isJsxAttribute(node) && node.name.getText() === 'className' && node.initializer) {
        const init = node.initializer

        // className="..."
        if (ts.isStringLiteral(init)) {
          const replacement = classReplacementMap[init.text]
          if (replacement) {
            // Replace with styles object reference (as Identifier)
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(undefined, ts.factory.createIdentifier(replacement))
            )
          }
        }

        // className={cn(...)} or className={...}
        if (ts.isJsxExpression(init) && init.expression) {
          const transformed = transformClassExpression(init.expression, classReplacementMap)
          return ts.factory.updateJsxAttribute(
            node,
            node.name,
            ts.factory.createJsxExpression(undefined, transformed)
          )
        }
      }

      return ts.visitEachChild(node, visit, context)
    }

    return (node: T) => ts.visitNode(node, visit)
  }
}
