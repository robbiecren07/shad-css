import type { Result } from 'postcss'

declare module 'postcss' {
  interface Processor {
    process(css: string, opts?: any): Result
  }
}
