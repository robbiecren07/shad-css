export interface ComponentData {
  name: string
  dependencies: string[]
  files: ComponentFile[]
  type: string
}

export type ComponentFile = {
  name: string;
  content: string;
}