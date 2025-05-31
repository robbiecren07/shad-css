import ts from 'typescript'

/**
 * Injects an import statement for styles into the source text of a TypeScript/TSX file.
 * The import statement is added at the top of the file, right after any "use client" directive,
 * and before any other statements.
 *
 * @param sourceText - The source text of the TypeScript/TSX file.
 * @param modulePath - The path to the CSS module file to import. Defaults to './Component.module.css'.
 * @param fileName - The name of the file being processed, used for creating the source file. Defaults to 'index.tsx'.
 * @returns The updated source text with the styles import statement injected.
 */
export function injectStylesImport(
  sourceText: string,
  modulePath: string = './Component.module.css',
  fileName: string = 'index.tsx'
): string {
  // Create a source file with the provided source text and file name
  const sourceFile = ts.createSourceFile(
    fileName, // now dynamic
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const printer = ts.createPrinter()
  // Create an import declaration for the styles module
  const stylesImport = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('styles'), undefined),
    ts.factory.createStringLiteral(modulePath)
  )

  // Prepare an array to hold the updated statements
  const statements: ts.Statement[] = []
  let inserted = false

  // Iterate through the source file statements
  // and inject the styles import at the appropriate position
  for (const stmt of sourceFile.statements) {
    // Preserve "use client"
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isStringLiteral(stmt.expression) &&
      stmt.expression.text === 'use client'
    ) {
      statements.push(stmt)
      continue
    }

    // Insert right after all import declarations
    if (!inserted && !ts.isImportDeclaration(stmt)) {
      statements.push(stylesImport)
      inserted = true
    }

    statements.push(stmt)
  }

  // If we haven't inserted the styles import yet, add it at the end
  // This handles cases where there are no other statements
  if (!inserted) {
    statements.push(stylesImport)
  }

  // Create a new source file with the updated statements
  const updatedSource = ts.factory.updateSourceFile(sourceFile, statements)
  return printer.printFile(updatedSource)
}
