import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export function installDependency(deps: string[] | string, packageManager: string) {
  const depArray = Array.isArray(deps) ? deps : [deps]

  // Load package.json
  let pkg: any = {}
  const pkgPath = path.join(process.cwd(), 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    } catch (e) {
      console.warn('Warning: Could not parse package.json. Skipping dependency check.')
    }
  }

  // Merge dependencies and devDependencies
  const installedDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  }

  // Filter out already installed dependencies
  const toInstall = depArray.filter((dep) => !installedDeps || !installedDeps[dep])

  if (toInstall.length === 0) {
    console.log('\nAll dependencies already installed. Skipping install dependencies step.')
    return
  }

  let installCmd: string
  let args: string[] = []

  switch (packageManager) {
    case 'npm':
      installCmd = 'npm'
      args = ['install', ...toInstall]
      break
    case 'yarn':
      installCmd = 'yarn'
      args = ['add', ...toInstall]
      break
    case 'pnpm':
      installCmd = 'pnpm'
      args = ['add', ...toInstall]
      break
    case 'bun':
      installCmd = 'bun'
      args = ['add', ...toInstall]
      break
    default:
      throw new Error('Unsupported package manager: ' + packageManager)
  }

  console.log(`\nInstalling ${toInstall.join(', ')} using ${packageManager}...`)
  const result = spawnSync(installCmd, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`Failed to install ${toInstall.join(', ')} with ${packageManager}`)
  }
}
