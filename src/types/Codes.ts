import { Position, Uri } from 'vscode'

export interface MethodDeclaration {
  name: string
  position: Position
}

export interface MapperStruct {
  uri: Uri
  namespace: string
  methods: Array<MethodDeclaration>
  type: MapperType
}

export type MapperType = 'main' | 'test'
