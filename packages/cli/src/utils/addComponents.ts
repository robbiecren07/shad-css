import type { AddComponentWithDepsParams, ComponentData } from '@/types'
import fs from 'node:fs'
import path from 'path'
import prompts from 'prompts'
import { addSingleComponent } from './addSingleComponent'
import { installDependency } from './installDependency'

export async function addComponents(params: AddComponentWithDepsParams) {
  const { component, config, options = {}, __dirname, packageManager } = params

  const { overwrite = false, visited = new Set<string>(), silent = false } = options

  // Prevent re-installing the same registry component
  if (visited.has(component)) return
  visited.add(component)

  // Load component metadata
  const componentPath = path.join(
    __dirname,
    '../data/components',
    config.theme,
    `${component}.json`
  )

  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component '${component}' not found for theme '${config.theme}'`)
  }

  const componentData: ComponentData = JSON.parse(fs.readFileSync(componentPath, 'utf-8'))

  // Handle registryDependencies first, recursively
  if (componentData.registryDependencies && componentData.registryDependencies.length > 0) {
    for (const dep of componentData.registryDependencies) {
      await addComponents({
        component: dep,
        config,
        options: { overwrite, visited, silent: true }, // silent: true prevents log spam for internals
        __dirname,
        packageManager,
      })
    }
  }

  // Now add this component's files
  const targetDir = path.join(process.cwd(), config.outputDir, component)
  fs.mkdirSync(targetDir, { recursive: true })

  // Check for existing files
  const existingFiles = componentData.files.filter((file) => {
    const filePath = path.join(targetDir, `${file.name}.${file.type}`)
    return fs.existsSync(filePath)
  })

  let shouldOverwrite = overwrite
  if (!shouldOverwrite && existingFiles.length > 0 && !silent) {
    const { overwriteConfirmed } = await prompts({
      type: 'toggle',
      name: 'overwriteConfirmed',
      message: `Component '${component}' already exists. Overwrite?`,
      initial: false,
      active: 'yes',
      inactive: 'no',
    })
    shouldOverwrite = overwriteConfirmed
    if (!shouldOverwrite) {
      if (!silent) {
        console.log(`Add command cancelled for '${component}'. No files were overwritten.`)
      }
      return
    }
  }

  await addSingleComponent({
    targetDir,
    files: componentData.files,
  })

  // Install NPM dependencies (skip if already installed by a previous registryDependency)
  if (componentData.dependencies && componentData.dependencies.length > 0) {
    installDependency(componentData.dependencies, packageManager)
  }

  if (!silent) {
    console.log(`\n✅ Successfully added ${component} component!`)
  }
}
