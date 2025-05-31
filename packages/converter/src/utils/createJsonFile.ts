/**
 * Creates a structured JSON representation of a component.
 *
 * This function generates a JSON object with the following structure:
 * - name: Component name
 * - dependencies: Array of component dependencies
 * - registryDependencies: Array of registry dependencies
 * - files: Array containing both TSX and CSS module files
 * - type: Component type identifier
 *
 * @param componentName The name of the component.
 * @param dependencies Array of component dependencies (optional).
 * @param registryDependencies Array of registry dependencies (optional).
 * @param tsxContent The TSX content of the component.
 * @param cssContent The CSS module content of the component.
 * @returns A promise that resolves to an object containing the JSON string.
 */
export async function createJsonFile(
  componentName: string,
  dependencies: string[] | undefined,
  registryDependencies: string[] | undefined,
  tsxContent: string,
  cssContent: string
): Promise<{ json: string }> {
  // Build the component JSON structure
  const jsonData = {
    // Component metadata
    name: componentName,
    dependencies: dependencies || [],
    registryDependencies: registryDependencies || [],
    type: 'components:ui',

    // Component files
    files: [
      {
        type: 'tsx',
        name: 'index.tsx',
        content: tsxContent,
      },
      {
        type: 'css',
        name: `${componentName}.module.css`,
        content: cssContent,
      },
    ],
  }

  // Format JSON with 2-space indentation
  const jsonString = JSON.stringify(jsonData, null, 2)

  return {
    json: jsonString,
  }
}
