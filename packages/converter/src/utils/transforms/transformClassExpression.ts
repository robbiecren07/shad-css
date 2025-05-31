import ts from 'typescript'

/**
 * Transforms a TypeScript expression that may contain class names,
 * such as string literals, call expressions, arrays, or conditionals,
 * replacing them with identifiers based on a provided mapping.
 *
 * @param expr A TypeScript expression that may contain class names,
 * string literals, call expressions, arrays, or conditionals.
 * @param map A mapping object where keys are original class names (as strings)
 * and values are the identifiers to replace them with.
 * @returns A transformed TypeScript expression with class names replaced by identifiers.
 */
export function transformClassExpression(
  expr: ts.Expression,
  map: Record<string, string>
): ts.Expression {
  // Replace string literals inside cn(...) or arrays or conditionals
  if (ts.isCallExpression(expr)) {
    const args = expr.arguments.map((arg) => {
      if (ts.isStringLiteral(arg) && map[arg.text]) {
        // If the argument is a string literal and exists in the map, replace it with the identifier
        return ts.factory.createIdentifier(map[arg.text])
      }
      // If the argument is an expression, recursively transform it
      return ts.isExpression(arg) ? transformClassExpression(arg, map) : arg
    })
    return ts.factory.updateCallExpression(expr, expr.expression, expr.typeArguments, args)
  }

  // Handle arrays and conditionals
  if (ts.isArrayLiteralExpression(expr)) {
    const elements = expr.elements.map((el) =>
      ts.isStringLiteral(el) && map[el.text] ? ts.factory.createIdentifier(map[el.text]) : el
    )
    return ts.factory.updateArrayLiteralExpression(expr, elements)
  }

  // Handle binary expressions (e.g., concatenation)
  if (ts.isBinaryExpression(expr)) {
    return ts.factory.updateBinaryExpression(
      expr,
      transformClassExpression(expr.left, map),
      expr.operatorToken,
      transformClassExpression(expr.right, map)
    )
  }

  // Handle conditional expressions (ternary operator)
  if (ts.isConditionalExpression(expr)) {
    return ts.factory.updateConditionalExpression(
      expr,
      expr.condition,
      expr.questionToken,
      transformClassExpression(expr.whenTrue, map),
      expr.colonToken,
      transformClassExpression(expr.whenFalse, map)
    )
  }

  // If it's a string literal and exists in the map, replace it with the identifier
  if (ts.isStringLiteral(expr) && map[expr.text]) {
    return ts.factory.createIdentifier(map[expr.text])
  }

  return expr
}
