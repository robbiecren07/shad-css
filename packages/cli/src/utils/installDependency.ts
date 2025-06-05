import { DEV_DEPS } from '@/lib/contants'
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
    //console.log('\nAll dependencies already installed. Skipping install dependencies step.')
    return
  }

  for (const dep of toInstall) {
    let installCmd: string
    let args: string[] = []

    // Check if this dep is a dev dependency
    const isDevDep = DEV_DEPS.includes(dep)

    switch (packageManager) {
      case 'npm':
        installCmd = 'npm'
        args = ['install', dep]
        if (isDevDep) args.push('--save-dev')
        break
      case 'yarn':
        installCmd = 'yarn'
        args = ['add', dep]
        if (isDevDep) args.push('--dev')
        break
      case 'pnpm':
        installCmd = 'pnpm'
        args = ['add', dep]
        if (isDevDep) args.push('--save-dev')
        break
      case 'bun':
        installCmd = 'bun'
        args = ['add', dep]
        if (isDevDep) args.push('--dev')
        break
      default:
        throw new Error('Unsupported package manager: ' + packageManager)
    }

    const result = spawnSync(installCmd, args, { encoding: 'utf-8' })
    if (result.status !== 0) {
      console.warn(
        `Failed to install ${dep} with ${packageManager}. Skipping... You may need to install it manually.`
      )
      // Optionally: throw or just warn and continue
    }
  }
}
