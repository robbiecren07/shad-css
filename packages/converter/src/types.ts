import type ts from 'typescript'

export interface ComponentData {
  name: string
  dependencies: string[] | undefined
  registryDependencies: string[] | undefined
  files: ComponentFile[]
  type: string
}

export type ComponentFile = {
  name: string
  content: string
}

export interface ExtractedClassName {
  class: string
  hint?: string
}

export interface ClassNameUsage {
  class: string
  hint: string
  loc: number
}

export interface CvaCallInfo {
  variableName: string
  baseClassName: string
  variants: Record<string, Record<string, string>> // {variant: {default: 'tw', destructive: 'tw', ...}}
  node: ts.CallExpression
}
