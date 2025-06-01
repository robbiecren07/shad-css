import ts from 'typescript'
import { transformClassExpression } from './transformClassExpression'

/**
 * Creates a TypeScript AST transformer that rewrites JSX `className` attributes
 * to use CSS module references based on the given classReplacementMap.
 *
 * Replaces:
 *   - className="foo"          →  className={styles.foo}
 *   - className={cn(...)}      →  className={cn(styles.foo, ...)}
 *   - className={...}          →  className={styles.foo} (where possible)
 *
 * @param classReplacementMap Map of original class names to CSS module identifiers
 * @returns Transformer function suitable for use with ts.transform
 */
export function transformClassNames(classReplacementMap: Record<string, string>) {
  return <T extends ts.Node>(context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Only process JSX className attributes
      if (ts.isJsxAttribute(node) && node.name.getText() === 'className' && node.initializer) {
        const init = node.initializer

        // Handle: className="foo"
        if (ts.isStringLiteral(init)) {
          const replacement = classReplacementMap[init.text]
          if (replacement) {
            // Replace with: className={styles.foo}
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(undefined, ts.factory.createIdentifier(replacement))
            )
          }
        }

        // Handle: className={...} or className={cn(...)}
        if (ts.isJsxExpression(init) && init.expression) {
          const transformed = transformClassExpression(init.expression, classReplacementMap)
          return ts.factory.updateJsxAttribute(
            node,
            node.name,
            ts.factory.createJsxExpression(undefined, transformed)
          )
        }
      }

      // Visit all other nodes recursively
      return ts.visitEachChild(node, visit, context)
    }

    // Entry point for the transformer
    return (node: T) => ts.visitNode(node, visit)
  }
}
