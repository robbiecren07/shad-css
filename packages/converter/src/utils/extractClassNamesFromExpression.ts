import ts from 'typescript'

/**
 * Recursively extracts class names from complex TypeScript expressions.
 *
 * This function handles various expression types that may contain class names:
 * - String literals and template literals
 * - Function calls with class name arguments
 * - Binary expressions (e.g., string concatenation)
 * - Conditional expressions (e.g., ternary operators)
 * - Object literals with class name properties
 * - Array literals with class name elements
 *
 * @param expr A TypeScript expression that may contain class names.
 * @returns An array of class names extracted from the expression.
 */
export function extractClassNamesFromExpression(expr: ts.Expression): string[] {
  const classNames: string[] = []

  // Handle different expression types
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    // Handle simple string literals
    classNames.push(expr.text)
  } else if (ts.isCallExpression(expr)) {
    // Handle function calls
    // Extract class names from all arguments
    for (const arg of expr.arguments) {
      if (ts.isExpression(arg)) {
        classNames.push(...extractClassNamesFromExpression(arg))
      }
    }
  } else if (ts.isBinaryExpression(expr)) {
    // Handle binary operations (e.g., string concatenation)
    // Extract class names from both operands
    classNames.push(
      ...extractClassNamesFromExpression(expr.left),
      ...extractClassNamesFromExpression(expr.right)
    )
  } else if (ts.isConditionalExpression(expr)) {
    // Handle conditional expressions (e.g., ternary operators)
    // Extract class names from both branches
    classNames.push(
      ...extractClassNamesFromExpression(expr.whenTrue),
      ...extractClassNamesFromExpression(expr.whenFalse)
    )
  } else if (ts.isObjectLiteralExpression(expr)) {
    // Handle object literals
    // Extract class names from property keys
    for (const prop of expr.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
          classNames.push(key.text)
        }
      }
    }
  } else if (ts.isArrayLiteralExpression(expr)) {
    // Handle array literals
    // Extract class names from all elements
    for (const el of expr.elements) {
      if (ts.isExpression(el)) {
        classNames.push(...extractClassNamesFromExpression(el))
      }
    }
  }

  return classNames
}
