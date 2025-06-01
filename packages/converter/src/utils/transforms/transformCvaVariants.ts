import ts from 'typescript'
import { capitalize, toCamelCase } from '../helpers'

/**
 * TypeScript AST transformer that rewrites cva() calls,
 * converting Tailwind string values into CSS module style references.
 *
 * For example:
 *   cva('tw-classes', { variants: { variant: { default: 'tw', destructive: 'tw2' }}})
 * Becomes:
 *   cva(styles.buttonBase, { variants: { variant: { default: styles.buttonDefault, destructive: styles.buttonDestructive }}})
 *
 * This ensures all class assignments are type-safe and point to generated CSS modules.
 *
 * @param componentName Name of the component, used to generate CSS module keys.
 * @returns Transformer suitable for use in ts.transform().
 */
export function transformCvaVariants(componentName: string) {
  const baseKey = toCamelCase(`${componentName}Base`)
  return <T extends ts.Node>(context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Transform: const buttonVariants = cva(...)
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        node.initializer.expression.getText() === 'cva'
      ) {
        const [baseClassNode, optionsNode] = node.initializer.arguments

        // Replace the base Tailwind string with styles.xxx
        let newBaseClassNode = baseClassNode
        if (baseClassNode && ts.isStringLiteral(baseClassNode)) {
          newBaseClassNode = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('styles'),
            ts.factory.createIdentifier(baseKey)
          )
        }

        // Recursively rewrite variant values (e.g., 'default': 'tw') as styles.xxx
        let newOptionsNode = optionsNode
        if (optionsNode && ts.isObjectLiteralExpression(optionsNode)) {
          const newProps = optionsNode.properties.map((prop) => {
            // Only process the "variants" property
            if (
              ts.isPropertyAssignment(prop) &&
              prop.name.getText() === 'variants' &&
              ts.isObjectLiteralExpression(prop.initializer)
            ) {
              // Each variant type (e.g., variant, size)
              const newVariants = prop.initializer.properties.map((v) => {
                if (
                  ts.isPropertyAssignment(v) &&
                  ts.isIdentifier(v.name) &&
                  ts.isObjectLiteralExpression(v.initializer)
                ) {
                  // For each variant value (e.g. default, destructive)
                  const newVariantValues = v.initializer.properties.map((val) => {
                    if (
                      ts.isPropertyAssignment(val) &&
                      ts.isIdentifier(val.name) &&
                      ts.isStringLiteral(val.initializer)
                    ) {
                      // Convert: 'default': 'tw' → 'default': styles.buttonDefault
                      const stylesKey = componentName.toLowerCase() + capitalize(val.name.text)
                      return ts.factory.updatePropertyAssignment(
                        val,
                        val.name,
                        ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier('styles'),
                          ts.factory.createIdentifier(stylesKey)
                        )
                      )
                    }
                    return val
                  })

                  return ts.factory.updatePropertyAssignment(
                    v,
                    v.name,
                    ts.factory.createObjectLiteralExpression(newVariantValues, true)
                  )
                }
                return v
              })
              return ts.factory.updatePropertyAssignment(
                prop,
                prop.name,
                ts.factory.createObjectLiteralExpression(newVariants, true)
              )
            }
            return prop
          })
          newOptionsNode = ts.factory.updateObjectLiteralExpression(optionsNode, newProps)
        }

        // Build new argument list with transformed values
        const originalArgs = node.initializer.arguments

        let newArgs: ts.Expression[] = []
        if (originalArgs.length === 1) {
          newArgs = [newBaseClassNode]
        } else if (originalArgs.length === 2) {
          newArgs = [newBaseClassNode, newOptionsNode]
        } else {
          newArgs = [...originalArgs] // fallback: preserve all args
        }

        // Return updated variable declaration with rewritten cva() call
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          node.exclamationToken,
          node.type,
          ts.factory.updateCallExpression(
            node.initializer,
            node.initializer.expression,
            node.initializer.typeArguments,
            newArgs
          )
        )
      }
      // Recursively visit all other nodes
      return ts.visitEachChild(node, visit, context)
    }
    return (node: T) => ts.visitNode(node, visit)
  }
}
