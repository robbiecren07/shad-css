import ts from 'typescript'
import { capitalize, toCamelCase } from '../helpers'

/**
 * AST transformer to rewrite cva() calls from Tailwind strings to styles.xxx references.
 *
 * Example:
 *   cva('tw-classes', { variants: { variant: { default: 'tw', ... } } })
 * becomes:
 *   cva(styles.buttonBase, { variants: { variant: { default: styles.buttonDefault, ... } } })
 */
export function transformCvaVariants(componentName: string) {
  const baseKey = toCamelCase(`${componentName}Base`)
  return <T extends ts.Node>(context: ts.TransformationContext) => {
    const visit = (node: ts.Node): ts.Node => {
      // Find variable declarations like: const buttonVariants = cva(...)
      if (
        ts.isVariableDeclaration(node) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        node.initializer.expression.getText() === 'cva'
      ) {
        const [baseClassNode, optionsNode] = node.initializer.arguments

        // Replace base class string literal with styles.xxx
        let newBaseClassNode = baseClassNode
        if (baseClassNode && ts.isStringLiteral(baseClassNode)) {
          newBaseClassNode = ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('styles'),
            ts.factory.createIdentifier(baseKey)
          )
        }

        // Deep rewrite for variants and size objects
        let newOptionsNode = optionsNode
        if (optionsNode && ts.isObjectLiteralExpression(optionsNode)) {
          const newProps = optionsNode.properties.map((prop) => {
            if (
              ts.isPropertyAssignment(prop) &&
              prop.name.getText() === 'variants' &&
              ts.isObjectLiteralExpression(prop.initializer)
            ) {
              // For each variant type (e.g. variant, size)
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
                      // Generate the styles key, e.g. buttonDestructive
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

        // Return new variable declaration with updated cva() call
        const originalArgs = node.initializer.arguments

        let newArgs: ts.Expression[] = []
        if (originalArgs.length === 1) {
          newArgs = [newBaseClassNode]
        } else if (originalArgs.length === 2) {
          newArgs = [newBaseClassNode, newOptionsNode]
        } else {
          // fallback: preserve all args
          newArgs = [...originalArgs]
        }

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
      return ts.visitEachChild(node, visit, context)
    }
    return (node: T) => ts.visitNode(node, visit)
  }
}
