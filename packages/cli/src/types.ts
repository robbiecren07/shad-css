export type ShadCssConfig = {
  theme: string
  baseColor: string
  outputDir: string
  componentsAlias: string
  globalStylesheet: string
  iconLibrary: string
}

export interface ComponentData {
  name: string
  dependencies: string[] | []
  registryDependencies: string[] | []
  files: ComponentFile[]
  type: string
}

export type ComponentFile = {
  type: 'tsx' | 'css' | 'scss' | 'json'
  name: string
  content: string
}

export type AddComponentOptions = {
  targetDir: string
  files: ComponentFile[]
}

export type AddComponentWithDepsParams = {
  component: string
  config: ShadCssConfig
  options?: {
    overwrite?: boolean
    visited?: Set<string>
    silent?: boolean
  }
  __dirname: string
  packageManager: string
}
