import { execSync } from 'child_process'

/**
 * Detect the package manager used in the project
 * @returns 'npm', 'yarn', or 'pnpm'
 */
export function detectPackageManager(): string {
  try {
    execSync('npm --version', { stdio: 'ignore' })
    return 'npm'
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' })
      return 'yarn'
    } catch {
      try {
        execSync('pnpm --version', { stdio: 'ignore' })
        return 'pnpm'
      } catch {
        throw new Error('No supported package manager found (npm, yarn, or pnpm)')
      }
    }
  }
}