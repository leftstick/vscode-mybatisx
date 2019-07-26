import { dirname, basename } from 'path'
import { TextDocument } from 'vscode'
import { Mapper, MapperType } from '../types/Codes'

export interface IMapperParser {
  isValid(doc: TextDocument): boolean

  parse(document: TextDocument): Mapper | undefined
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

export function getFsPathBasedOnMapperType(filePath: string): string | undefined {
  let curDirname = dirname(filePath)
  while (curDirname && curDirname !== '/') {
    const folderName = basename(curDirname)
    if (folderName === 'main' || folderName === 'test') {
      return curDirname
    }
    curDirname = dirname(curDirname)
  }
}
