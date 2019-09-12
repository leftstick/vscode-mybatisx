import * as path from 'path'
import { TextDocument } from 'vscode'
import { Token, Service } from 'typedi'
import { MethodDeclaration, Mapper, MapperType } from '../types/Codes'
import { IMapperParser, getMapperType } from './MapperParser'

export const IJavaMapperParserToken = new Token<IMapperParser>()

@Service(IJavaMapperParserToken)
class JavaMapperParser implements IMapperParser {
  isValid(doc: TextDocument): boolean {
    if (!doc) {
      return false
    }
    return true
  }

  parse(document: TextDocument): Mapper | undefined {
    const xmlContent = document.getText()

    const matchedPacakgeName = xmlContent.match(/package\s+([a-zA-Z_\.]+)?;/)
    if (!matchedPacakgeName || !matchedPacakgeName[1]) {
      return
    }
    const matchedClassName = xmlContent.match(/(?:interface|class)\s+([\w|\d]*)?/)
    if (!matchedClassName || !matchedClassName[1]) {
      return
    }
    const namespace = `${matchedPacakgeName[1]}.${matchedClassName[1]}`

    const methods = findMethodDeclarations(document)

    const mapperType = getMapperType(document.uri.fsPath)

    if (!mapperType) {
      return
    }

    return {
      namespace,
      uri: document.uri,
      methods,
      type: mapperType
    }
  }
}

function findMethodDeclarations(document: TextDocument): Array<MethodDeclaration> {
  const fileContent = document.getText()
  const matched = fileContent.match(/(?:interface|class).+.+{([\s\n\r\S]*)}/)
  if (!matched) {
    return []
  }
  const classOrInterfaceContent = matched[1]
  if (!classOrInterfaceContent) {
    return []
  }

  const rawMethods = classOrInterfaceContent.match(/\s+([a-zA-Z_0-9]+)(\s*)\((.*)\)/g)

  if (!rawMethods) {
    return []
  }
  return rawMethods
    .filter(m => !!m)
    .map(m => m.trim())
    .map(m => m.replace(/\s*\(.*\)/, ''))
    .map(m => {
      const startOffset = fileContent.indexOf(m)
      return {
        name: m,
        startPosition: document.positionAt(startOffset),
        endPosition: document.positionAt(startOffset + m.length)
      }
    })
}
