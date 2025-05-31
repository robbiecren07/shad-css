import ts from 'typescript'

/**
 * Injects a CSS module import statement into a TypeScript/TSX file.
 *
 * This function:
 * 1. Creates a TypeScript source file from the input text
 * 2. Creates an import declaration for the styles module
 * 3. Processes existing statements to:
 *    - Preserve "use client" directives
 *    - Insert styles import after imports but before other statements
 *    - Add import at the end if no other statements exist
 * 4. Returns the updated source text with the new import
 *
 * @param sourceText The source text of the TypeScript/TSX file.
 * @param modulePath The path to the CSS module file to import. Defaults to './Component.module.css'.
 * @param fileName The name of the file being processed, used for creating the source file. Defaults to 'index.tsx'.
 * @returns The updated source text with the styles import statement injected.
 */
export function injectStylesImport(
  sourceText: string,
  modulePath: string = './Component.module.css',
  fileName: string = 'index.tsx'
): string {
  // Create TypeScript source file from input text
  // - Used for AST manipulation and printing
  const sourceFile = ts.createSourceFile(
    fileName, // now dynamic
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  const printer = ts.createPrinter()
  // Create the styles import declaration
  // - Imports 'styles' from the specified module path
  // - Uses TypeScript's factory to create the AST node
  const stylesImport = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('styles'), undefined),
    ts.factory.createStringLiteral(modulePath)
  )

  // Prepare for statement processing
  // - Array to collect updated statements
  // - Flag to track if styles import has been inserted
  const statements: ts.Statement[] = []
  let inserted = false

  // Process existing statements
  for (const stmt of sourceFile.statements) {
    // Preserve "use client" directives
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isStringLiteral(stmt.expression) &&
      stmt.expression.text === 'use client'
    ) {
      statements.push(stmt)
      continue
    }

    // Insert styles import after imports but before other statements
    if (!inserted && !ts.isImportDeclaration(stmt)) {
      statements.push(stylesImport)
      inserted = true
    }

    statements.push(stmt)
  }

  // Add styles import at the end if no other statements exist
  // This handles empty files or files with no imports
  if (!inserted) {
    statements.push(stylesImport)
  }

  // Generate updated source text
  // - Create new source file with all statements
  // - Print the AST back to text
  const updatedSource = ts.factory.updateSourceFile(sourceFile, statements)
  return printer.printFile(updatedSource)
}
