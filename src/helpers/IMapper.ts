import { dirname, basename } from 'path'
import { TextDocument } from 'vscode'
import { MapperStruct, MapperType } from '../types/Codes'

export interface IMapper {
  isValid(doc: TextDocument): boolean

  parse(document: TextDocument): MapperStruct | undefined
}

export function getMapperType(filePath: string): MapperType | undefined {
  let curDirname = dirname(filePath)
  while (curDirname && curDirname !== '/') {
    const folderName = basename(curDirname)
    if (folderName === 'main' || folderName === 'test') {
      return folderName
    }
    curDirname = dirname(curDirname)
  }
}
