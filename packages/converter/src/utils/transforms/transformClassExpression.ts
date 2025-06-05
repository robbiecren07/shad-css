import ts from 'typescript'
//import { capitalize } from '../helpers'

/**
 * Recursively transforms any TypeScript expression representing class names
 * (including calls like cn(...), variants(), arrays, conditionals, etc.)
 * into references to their corresponding CSS module style.
 *
 * This handles a variety of code patterns:
 *   - Custom variant helpers like toggleVariants() and buttonVariants()
 *   - Utility calls (e.g., cn("a", cond && "b"))
 *   - Arrays and binary (string concatenation) expressions
 *   - Ternaries and direct string literals
 *
 * @param expr TypeScript expression that may represent one or more class names.
 * @param map Map of original class names to their CSS module reference identifiers.
 * @returns The transformed expression with class names replaced as needed.
 */
export function transformClassExpression(
  expr: ts.Expression,
  map: Record<string, string>
): ts.Expression {
  // Special case: handle toggleVariants() calls (with variant/size props)
  // if (
  //   ts.isCallExpression(expr) &&
  //   ((ts.isIdentifier(expr.expression) && expr.expression.text === 'toggleVariants') ||
  //     (ts.isPropertyAccessExpression(expr.expression) &&
  //       expr.expression.name.text === 'toggleVariants'))
  // ) {
  //   // If arguments are provided, generate the correct styles lookup for variant/size
  //   if (expr.arguments.length === 1 && ts.isObjectLiteralExpression(expr.arguments[0])) {
  //     const props = expr.arguments[0].properties
  //     let variantProp = null
  //     let sizeProp = null
  //     for (const prop of props) {
  //       if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
  //         if (prop.name.text === 'variant') variantProp = prop.initializer
  //         if (prop.name.text === 'size') sizeProp = prop.initializer
  //       }
  //     }

  //     // Access styles for both variant and size (as: styles[`toggleItem${variant}`], etc.)
  //     const variantExpr = ts.factory.createElementAccessExpression(
  //       ts.factory.createIdentifier('toggleStyles'),
  //       ts.factory.createTemplateExpression(ts.factory.createTemplateHead('toggleItem'), [
  //         ts.factory.createTemplateSpan(
  //           variantProp || ts.factory.createStringLiteral('default'),
  //           ts.factory.createTemplateTail('')
  //         ),
  //       ])
  //     )

  //     const sizeExpr = ts.factory.createElementAccessExpression(
  //       ts.factory.createIdentifier('toggleStyles'),
  //       ts.factory.createTemplateExpression(ts.factory.createTemplateHead('toggleItem'), [
  //         ts.factory.createTemplateSpan(
  //           sizeProp || ts.factory.createStringLiteral('default'),
  //           ts.factory.createTemplateTail('')
  //         ),
  //       ])
  //     )

  //     // Return: cn(styles[`toggleItem${variant}`], styles[`toggleItem${size}`])
  //     return ts.factory.createCallExpression(ts.factory.createIdentifier('cn'), undefined, [
  //       variantExpr,
  //       sizeExpr,
  //     ])
  //   }

  //   // Default/fallback if no arguments: styles.toggleItemDefault
  //   return ts.factory.createPropertyAccessExpression(
  //     ts.factory.createIdentifier('styles'),
  //     ts.factory.createIdentifier('toggleItemDefault')
  //   )
  // }

  // Special case: handle buttonVariants() calls (with or without "variant" prop)
  // if (
  //   ts.isCallExpression(expr) &&
  //   ((ts.isIdentifier(expr.expression) && expr.expression.text === 'buttonVariants') ||
  //     (ts.isPropertyAccessExpression(expr.expression) &&
  //       expr.expression.name.text === 'buttonVariants'))
  // ) {
  //   // No arguments: default to buttonStyles.buttonBase
  //   if (expr.arguments.length === 0) {
  //     return ts.factory.createPropertyAccessExpression(
  //       ts.factory.createIdentifier('buttonStyles'),
  //       ts.factory.createIdentifier('buttonBase')
  //     )
  //   }
  //   // If variant prop provided: map to buttonStyles.buttonVariant
  //   if (expr.arguments.length === 1) {
  //     const arg = expr.arguments[0]
  //     if (ts.isObjectLiteralExpression(arg)) {
  //       for (const prop of arg.properties) {
  //         if (
  //           ts.isPropertyAssignment(prop) &&
  //           prop.name.getText() === 'variant' &&
  //           ts.isStringLiteral(prop.initializer)
  //         ) {
  //           const variantValue = prop.initializer.text
  //           const styleKey = 'button' + capitalize(variantValue)
  //           return ts.factory.createPropertyAccessExpression(
  //             ts.factory.createIdentifier('buttonStyles'),
  //             ts.factory.createIdentifier(styleKey)
  //           )
  //         }
  //       }
  //     }
  //   }
  // }

  // Generic case: transform call expressions (e.g., cn(...))
  if (ts.isCallExpression(expr)) {
    // Replace string literals with mapped identifiers
    const args = expr.arguments.map((arg) => {
      if (ts.isStringLiteral(arg) && map[arg.text]) {
        return ts.factory.createIdentifier(map[arg.text])
      }
      // Recursively process all other arguments
      return ts.isExpression(arg) ? transformClassExpression(arg, map) : arg
    })
    return ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args)
  }

  // Transform arrays of class names (e.g., ["a", cond && "b"])
  if (ts.isArrayLiteralExpression(expr)) {
    // Replace string literals with CSS module references
    const elements = expr.elements.map((el) =>
      ts.isStringLiteral(el) && map[el.text] ? ts.factory.createIdentifier(map[el.text]) : el
    )
    return ts.factory.updateArrayLiteralExpression(expr, elements)
  }

  // Handle string concatenation (e.g., "a" + cond)
  if (ts.isBinaryExpression(expr)) {
    // Recursively transform both sides of the expression
    return ts.factory.updateBinaryExpression(
      expr,
      transformClassExpression(expr.left, map),
      expr.operatorToken,
      transformClassExpression(expr.right, map)
    )
  }

  // Handle ternary (conditional) expressions (e.g., cond ? "a" : "b")
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

  // Replace any direct string literal if it maps to a CSS module reference
  if (ts.isStringLiteral(expr) && map[expr.text]) {
    return ts.factory.createIdentifier(map[expr.text])
  }

  // For any other expression, leave as-is
  return expr
}
