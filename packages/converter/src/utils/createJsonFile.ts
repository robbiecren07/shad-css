/**
 * Creates a JSON file with the specified component name, dependencies, TSX content, and CSS content.
 *
 * @param componentName - A string representing the name of the component.
 * @param dependencies - An array of strings representing the dependencies of the component.
 * @param tsxContent - A string containing the TSX content of the component.
 * @param cssContent - A string containing the CSS content of the component.
 * @returns A promise that resolves to an object containing the JSON string.
 */
export async function createJsonFile(
  componentName: string,
  dependencies: string[],
  tsxContent: string,
  cssContent: string
): Promise<{ json: string }> {
  // Create the JSON structure
  const jsonData = {
    name: componentName,
    dependencies: dependencies ? dependencies : [],
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
    type: 'components:ui',
  }

  // Convert JSON to string
  const jsonString = JSON.stringify(jsonData, null, 2)

  return {
    json: jsonString,
  }
}
