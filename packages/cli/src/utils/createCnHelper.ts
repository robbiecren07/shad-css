import fs from 'node:fs'
import path from 'path'

/**
 * Adds a cn helper in lib/utils.ts using classnames.
 * Creates lib/ if it doesn't exist.
 */
export function createCnHelper(utilsPath: string) {
  const contents = `export { default as cn } from "classnames"
`

  const libDir = path.dirname(utilsPath)
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true })
  }

  if (fs.existsSync(utilsPath)) {
    console.log(`\nℹ️  ${utilsPath} already exists. Skipping creation.`)
    return
  }

  fs.writeFileSync(utilsPath, contents)
}
