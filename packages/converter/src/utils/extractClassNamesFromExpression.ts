import type { ExtractedClassName } from '@/types'
import ts from 'typescript'

/**
 * Recursively extracts class names and their context from TypeScript expressions.
 *
 * This function handles various expression types that may contain class names:
 * 1. Simple string literals and template literals
 * 2. Function calls (e.g., cn(...))
 * 3. Logical expressions (e.g., inset && "pl-8")
 * 4. Ternary operators (e.g., inset ? "pl-8" : "pr-8")
 * 5. Object literals with class name properties
 * 6. Array literals with class name elements
 * 7. Parenthesized expressions
 *
 * Each extracted class name includes:
 * - The class name itself
 * - An optional hint (e.g., "inset" in "inset && 'pl-8'")
 * - The original expression context
 *
 * @param expr A TypeScript expression that may contain class names.
 * @returns An array of class names with their context information.
 */
export function extractClassNamesFromExpression(expr: ts.Expression): ExtractedClassName[] {
  const classNames: ExtractedClassName[] = []

  // Handle simple string literals and template literals
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    // Direct class name reference
    classNames.push({ class: expr.text })
  } else if (ts.isCallExpression(expr)) {
    // Handle class utility functions (e.g., cn(...))
    // Recursively extract classes from each argument
    for (const arg of expr.arguments) {
      if (ts.isExpression(arg)) {
        classNames.push(...extractClassNamesFromExpression(arg))
      }
    }
  } else if (ts.isBinaryExpression(expr)) {
    // Handle logical expressions
    if (expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
      // Logical AND (e.g., inset && "pl-8" or inset && styles.foo)
      // Extract hint from left side (e.g., "inset")
      let hint: string | undefined
      if (ts.isIdentifier(expr.left)) hint = expr.left.text
      if (ts.isPropertyAccessExpression(expr.left)) hint = expr.left.name.text
      
      // Extract class from right side and attach hint
      extractClassNamesFromExpression(expr.right).forEach((e) => {
        classNames.push({ ...e, hint: hint ?? e.hint })
      })
    } else {
      // For other binary operators, flatten both sides
      classNames.push(
        ...extractClassNamesFromExpression(expr.left),
        ...extractClassNamesFromExpression(expr.right)
      )
    }
  } else if (ts.isConditionalExpression(expr)) {
    // Handle ternary operators (e.g., inset ? "pl-8" : "pr-8")
    // Extract hint from condition (e.g., "inset")
    let hint: string | undefined
    if (ts.isIdentifier(expr.condition)) hint = expr.condition.text
    if (ts.isPropertyAccessExpression(expr.condition)) hint = expr.condition.name.text
    
    // Process both true and false branches with the hint
    classNames.push(
      ...extractClassNamesFromExpression(expr.whenTrue).map((e) => ({ ...e, hint })),
      ...extractClassNamesFromExpression(expr.whenFalse).map((e) => ({ ...e, hint }))
    )
  } else if (ts.isObjectLiteralExpression(expr)) {
    // Handle object-style class expressions (e.g., { [inset && 'pl-8']: true })
    for (const prop of expr.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name
        let className: string | undefined
        if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
          className = key.text
        }
        if (className) {
          // Try to infer hint from property initializer
          let hint: string | undefined
          if (ts.isIdentifier(prop.initializer)) {
            hint = prop.initializer.text
          }
          classNames.push({ class: className, hint })
        }
      }
    }
  } else if (ts.isArrayLiteralExpression(expr)) {
    // Handle array literals (e.g., ["class1", "class2"])
    for (const el of expr.elements) {
      if (ts.isExpression(el)) {
        classNames.push(...extractClassNamesFromExpression(el))
      }
    }
  } else if (ts.isParenthesizedExpression(expr)) {
    // Handle parenthesized expressions (e.g., ("class1" && "class2"))
    // Unwrap and process the inner expression
    classNames.push(...extractClassNamesFromExpression(expr.expression))
  }

  return classNames
}
