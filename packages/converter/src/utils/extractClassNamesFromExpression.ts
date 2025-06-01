import type { ExtractedClassName } from '@/types'
import ts from 'typescript'

/**
 * Recursively extracts class names and their optional "hint" from a TypeScript expression.
 *
 * Handles:
 *   - String and template literals
 *   - Utility calls (e.g., cn(...))
 *   - Logical AND (e.g., cond && "foo") and other binary expressions
 *   - Ternary expressions (e.g., cond ? "foo" : "bar")
 *   - Object and array literals containing class names
 *   - Parenthesized expressions
 *
 * For context-dependent cases (e.g., ternaries, logical AND),
 * the extracted class name will include a `hint` field if possible.
 *
 * @param expr TypeScript expression that may represent or contain class names.
 * @returns Array of extracted class names, each with optional context hint.
 */
export function extractClassNamesFromExpression(expr: ts.Expression): ExtractedClassName[] {
  const classNames: ExtractedClassName[] = []

  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    // Simple string or template literal
    classNames.push({ class: expr.text })
  } else if (ts.isCallExpression(expr)) {
    // Recursively extract from all call arguments (e.g., cn(...))
    for (const arg of expr.arguments) {
      if (ts.isExpression(arg)) {
        classNames.push(...extractClassNamesFromExpression(arg))
      }
    }
  } else if (ts.isBinaryExpression(expr)) {
    if (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      // Logical AND: left side is a hint, right side is the class
      let hint: string | undefined
      if (ts.isIdentifier(expr.left)) hint = expr.left.text
      if (ts.isPropertyAccessExpression(expr.left)) hint = expr.left.name.text
      extractClassNamesFromExpression(expr.right).forEach((e) => {
        classNames.push({ ...e, hint: hint ?? e.hint })
      })
    } else {
      // Other binary ops: flatten both sides
      classNames.push(
        ...extractClassNamesFromExpression(expr.left),
        ...extractClassNamesFromExpression(expr.right)
      )
    }
  } else if (ts.isConditionalExpression(expr)) {
    // Ternary: use the condition as the hint for both branches
    let hint: string | undefined
    if (ts.isIdentifier(expr.condition)) hint = expr.condition.text
    if (ts.isPropertyAccessExpression(expr.condition)) hint = expr.condition.name.text
    classNames.push(
      ...extractClassNamesFromExpression(expr.whenTrue).map((e) => ({ ...e, hint })),
      ...extractClassNamesFromExpression(expr.whenFalse).map((e) => ({ ...e, hint }))
    )
  } else if (ts.isObjectLiteralExpression(expr)) {
    // Object keys may be class names; try to extract them
    for (const prop of expr.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name
        let className: string | undefined
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
          className = key.text
        }
        if (className) {
          // Try to infer hint from initializer
          let hint: string | undefined
          if (ts.isIdentifier(prop.initializer)) {
            hint = prop.initializer.text
          }
          classNames.push({ class: className, hint })
        }
      }
    }
  } else if (ts.isArrayLiteralExpression(expr)) {
    // Recursively extract from all elements
    for (const el of expr.elements) {
      if (ts.isExpression(el)) {
        classNames.push(...extractClassNamesFromExpression(el))
      }
    }
  } else if (ts.isParenthesizedExpression(expr)) {
    // Unwrap and recurse
    classNames.push(...extractClassNamesFromExpression(expr.expression))
  }

  return classNames
}
