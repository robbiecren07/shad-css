import ts from 'typescript'
import { capitalize } from '../helpers'

/**
 * Transforms class name expressions into CSS module references.
 *
 * This function handles various expression types that may contain class names:
 * 1. Call expressions (e.g., cn(...))
 * 2. Array literals (e.g., ["class1", "class2"])
 * 3. Binary expressions (e.g., string concatenation)
 * 4. Conditional expressions (e.g., ternary operators)
 * 5. Simple string literals
 *
 * @param expr A TypeScript expression that may contain class names.
 * @param map A mapping object where keys are original class names and values are CSS module references.
 * @returns A transformed TypeScript expression with class names replaced by CSS module references.
 */
export function transformClassExpression(
  expr: ts.Expression,
  map: Record<string, string>
): ts.Expression {
  // --- 1. Handle toggleVariants() and toggleVariants({...}) calls FIRST!
  if (
    ts.isCallExpression(expr) &&
    ((ts.isIdentifier(expr.expression) && expr.expression.text === 'toggleVariants') ||
      (ts.isPropertyAccessExpression(expr.expression) &&
        expr.expression.name.text === 'toggleVariants'))
  ) {
    // If there is an argument object, try to build the styles lookup
    if (expr.arguments.length === 1 && ts.isObjectLiteralExpression(expr.arguments[0])) {
      const props = expr.arguments[0].properties
      let variantProp = null
      let sizeProp = null
      for (const prop of props) {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          if (prop.name.text === 'variant') variantProp = prop.initializer
          if (prop.name.text === 'size') sizeProp = prop.initializer
        }
      }

      // Build a cn(...) call with the appropriate computed style accesses
      const variantExpr = ts.factory.createElementAccessExpression(
        ts.factory.createIdentifier('toggleStyles'),
        ts.factory.createTemplateExpression(ts.factory.createTemplateHead('toggleItem'), [
          ts.factory.createTemplateSpan(
            variantProp || ts.factory.createStringLiteral('default'),
            ts.factory.createTemplateTail('')
          ),
        ])
      )

      const sizeExpr = ts.factory.createElementAccessExpression(
        ts.factory.createIdentifier('toggleStyles'),
        ts.factory.createTemplateExpression(ts.factory.createTemplateHead('toggleItem'), [
          ts.factory.createTemplateSpan(
            sizeProp || ts.factory.createStringLiteral('default'),
            ts.factory.createTemplateTail('')
          ),
        ])
      )

      // return: cn(styles[`toggleItem${variant}`], styles[`toggleItem${size}`])
      return ts.factory.createCallExpression(ts.factory.createIdentifier('cn'), undefined, [
        variantExpr,
        sizeExpr,
      ])
    }

    // fallback: just use styles.toggleItemDefault if no args
    return ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('styles'),
      ts.factory.createIdentifier('toggleItemDefault')
    )
  }

  // --- 2. Handle buttonVariants() and buttonVariants({...})
  if (
    ts.isCallExpression(expr) &&
    ((ts.isIdentifier(expr.expression) && expr.expression.text === 'buttonVariants') ||
      (ts.isPropertyAccessExpression(expr.expression) &&
        expr.expression.name.text === 'buttonVariants'))
  ) {
    // buttonVariants()
    if (expr.arguments.length === 0) {
      return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('buttonStyles'),
        ts.factory.createIdentifier('buttonBase')
      )
    }
    // buttonVariants({ variant: "outline" })
    if (expr.arguments.length === 1) {
      const arg = expr.arguments[0]
      if (ts.isObjectLiteralExpression(arg)) {
        for (const prop of arg.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name.getText() === 'variant' &&
            ts.isStringLiteral(prop.initializer)
          ) {
            const variantValue = prop.initializer.text
            const styleKey = 'button' + capitalize(variantValue)
            return ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('buttonStyles'),
              ts.factory.createIdentifier(styleKey)
            )
          }
        }
      }
    }
  }

  // --- 3. Now handle all other call expressions (including cn(...))
  if (ts.isCallExpression(expr)) {
    // Process each argument:
    // - Replace string literals with CSS module references
    // - Recursively transform nested expressions
    const args = expr.arguments.map((arg) => {
      if (ts.isStringLiteral(arg) && map[arg.text]) {
        return ts.factory.createIdentifier(map[arg.text])
      }
      return ts.isExpression(arg) ? transformClassExpression(arg, map) : arg
    })
    return ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args)
  }

  // Handle array literals
  if (ts.isArrayLiteralExpression(expr)) {
    // Replace string literals with CSS module references
    const elements = expr.elements.map((el) =>
      ts.isStringLiteral(el) && map[el.text] ? ts.factory.createIdentifier(map[el.text]) : el
    )
    return ts.factory.updateArrayLiteralExpression(expr, elements)
  }

  // Handle string concatenation
  if (ts.isBinaryExpression(expr)) {
    // Recursively transform both sides of the expression
    return ts.factory.updateBinaryExpression(
      expr,
      transformClassExpression(expr.left, map),
      expr.operatorToken,
      transformClassExpression(expr.right, map)
    )
  }

  // Handle ternary operators
  if (ts.isConditionalExpression(expr)) {
    // Recursively transform both branches
    return ts.factory.updateConditionalExpression(
      expr,
      expr.condition,
      expr.questionToken,
      transformClassExpression(expr.whenTrue, map),
      expr.colonToken,
      transformClassExpression(expr.whenFalse, map)
    )
  }

  // Handle simple string literals
  if (ts.isStringLiteral(expr) && map[expr.text]) {
    return ts.factory.createIdentifier(map[expr.text])
  }

  return expr
}
