import { Position, Uri } from 'vscode'

export interface MethodDeclaration {
  name: string
  startPosition: Position
  endPosition: Position
}

export interface Mapper {
  uri: Uri
  namespace: string
  methods: Array<MethodDeclaration>
  type: MapperType
  availableInsertPosition?: Position
}

export type MapperType = 'main' | 'test'
