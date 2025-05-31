import ts from 'typescript'

/**
 * This function recursively extracts class names from various types of expressions,
 * including string literals, call expressions, binary expressions, conditional expressions,
 * object literal expressions, and array literal expressions.
 * It handles cases where class names are defined as strings, concatenated, or passed as arguments
 * to functions.
 *
 * @param expr - A TypeScript expression that may contain class names.
 * @returns An array of class names extracted from the expression.
 */
export function extractClassNamesFromExpression(expr: ts.Expression): string[] {
  const classNames: string[] = []

  // Handle different types of expressions
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    classNames.push(expr.text)
    // Handle template literals
  } else if (ts.isCallExpression(expr)) {
    for (const arg of expr.arguments) {
      // If the argument is a string literal or a template literal, add it directly
      if (ts.isExpression(arg)) {
        // Recursively extract class names from the argument
        classNames.push(...extractClassNamesFromExpression(arg))
      }
    }
  } else if (ts.isBinaryExpression(expr)) {
    // For binary expressions, recursively extract class names from both sides
    classNames.push(
      ...extractClassNamesFromExpression(expr.left),
      ...extractClassNamesFromExpression(expr.right)
    )
  } else if (ts.isConditionalExpression(expr)) {
    // For conditional expressions, extract class names from both branches
    classNames.push(
      ...extractClassNamesFromExpression(expr.whenTrue),
      ...extractClassNamesFromExpression(expr.whenFalse)
    )
  } else if (ts.isObjectLiteralExpression(expr)) {
    // For object literal expressions, extract class names from property assignments
    for (const prop of expr.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name
        // If the key is an identifier or string literal, add its text to classNames
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
          classNames.push(key.text)
        }
      }
    }
  } else if (ts.isArrayLiteralExpression(expr)) {
    // For array literal expressions, recursively extract class names from each element
    for (const el of expr.elements) {
      if (ts.isExpression(el)) {
        classNames.push(...extractClassNamesFromExpression(el))
      }
    }
  }

  return classNames
}
