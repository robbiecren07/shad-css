import { NEEDS_BUTTON_STYLES, NEEDS_TOGGLE_STYLES } from '@/lib/constants'
import ts from 'typescript'

/**
 * Injects a CSS module import statement (and optionally supporting imports)
 * into a TypeScript/TSX file, preserving "use client" directives and proper import order.
 *
 * If the componentName is found in NEEDS_BUTTON_STYLES or NEEDS_TOGGLE_STYLES,
 * will also inject the appropriate supporting import.
 *
 * @param sourceText    The source code as a string.
 * @param modulePath    The path to the primary CSS module (default: './Component.module.css').
 * @param fileName      The name of the file (for source maps, etc. Default: 'index.tsx').
 * @param componentName The component's name (for optional supporting imports).
 * @returns             The updated source code as a string.
 */
export function injectStylesImport(
  sourceText: string,
  modulePath: string = './Component.module.css',
  fileName: string = 'index.tsx',
  componentName?: string
): string {
  // Parse source text into a TypeScript AST
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const printer = ts.createPrinter()

  // Always create the main styles import
  const stylesImport = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('styles'), undefined),
    ts.factory.createStringLiteral(modulePath)
  )

  // Optionally create supporting imports only if needed
  let buttonStylesImport: ts.ImportDeclaration | undefined
  let toggleStylesImport: ts.ImportDeclaration | undefined

  if (componentName && NEEDS_BUTTON_STYLES.includes(componentName)) {
    buttonStylesImport = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(false, ts.factory.createIdentifier('buttonStyles'), undefined),
      ts.factory.createStringLiteral('@/registry/new-york/ui/button/button.module.css')
    )
  }
  if (componentName && NEEDS_TOGGLE_STYLES.includes(componentName)) {
    toggleStylesImport = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(false, ts.factory.createIdentifier('toggleStyles'), undefined),
      ts.factory.createStringLiteral('@/registry/new-york/ui/toggle/toggle.module.css')
    )
  }

  // We'll collect statements here, inserting our imports at the right spot
  const statements: ts.Statement[] = []
  let inserted = false

  for (const stmt of sourceFile.statements) {
    // Always preserve "use client" directives at the very top
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isStringLiteral(stmt.expression) &&
      stmt.expression.text === 'use client'
    ) {
      statements.push(stmt)
      continue
    }

    // Inject imports after existing imports, before any other statement
    if (!inserted && !ts.isImportDeclaration(stmt)) {
      statements.push(stylesImport)
      if (buttonStylesImport) statements.push(buttonStylesImport)
      if (toggleStylesImport) statements.push(toggleStylesImport)
      inserted = true
    }

    statements.push(stmt)
  }

  // If all statements were imports or empty, insert our imports at the end
  if (!inserted) {
    statements.push(stylesImport)
    if (buttonStylesImport) statements.push(buttonStylesImport)
    if (toggleStylesImport) statements.push(toggleStylesImport)
  }

  // Print the updated AST back to source text
  const updatedSource = ts.factory.updateSourceFile(sourceFile, statements)
  return printer.printFile(updatedSource)
}
