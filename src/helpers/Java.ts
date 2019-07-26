import * as path from 'path'
import { TextDocument } from 'vscode'
import { MethodDeclaration, MapperStruct, MapperType } from '../types/Codes'
import { IMapper, getMapperType } from './IMapper'

class JavaMapper implements IMapper {
  isValid(doc: TextDocument): boolean {
    if (!doc) {
      return false
    }
    return /(interface|class).+extends[\s\S]+?Mapper/.test(doc.getText())
  }

  parse(document: TextDocument): MapperStruct | undefined {
    const xmlContent = document.getText()

    const matchedPacakgeName = xmlContent.match(/package\s+([a-zA-Z_\.]+)?;/)
    if (!matchedPacakgeName || !matchedPacakgeName[1]) {
      return
    }
    const matchedClassName = xmlContent.match(/(?:interface|class)\s+([a-zA-Z_]+)?\s+extends/)
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

export default new JavaMapper()

function findMethodDeclarations(document: TextDocument): Array<MethodDeclaration> {
  const fileContent = document.getText()
  const matched = fileContent.match(/(?:interface|class).+extends.+{([\s\n\r\S]*)}/)
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
    .map(r => r.trim())
    .map(m => {
      return {
        name: m,
        position: document.positionAt(fileContent.indexOf(m))
      }
    })
}
