import { spawnSync } from 'node:child_process'

export function installDependency(deps: string[] | string, packageManager: string) {
  const depArray = Array.isArray(deps) ? deps : [deps]

  if (depArray.length === 0) return

  let installCmd: string
  let args: string[] = []

  switch (packageManager) {
    case 'npm':
      installCmd = 'npm'
      args = ['install', ...depArray]
      break
    case 'yarn':
      installCmd = 'yarn'
      args = ['add', ...depArray]
      break
    case 'pnpm':
      installCmd = 'pnpm'
      args = ['add', ...depArray]
      break
    case 'bun':
      installCmd = 'bun'
      args = ['add', ...depArray]
      break
    default:
      throw new Error('Unsupported package manager: ' + packageManager)
  }

  console.log(`\nInstalling ${depArray.join(', ')} using ${packageManager}...`)
  const result = spawnSync(installCmd, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`Failed to install ${depArray.join(', ')} with ${packageManager}`)
  }
}
