import ts from 'typescript'

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
  // Handle class name utility calls (e.g., cn(...))
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
