import { TextDocument } from 'vscode'
import { Service, Token } from 'typedi'
import { Mapper, MethodDeclaration } from '../types/Codes'
import { IMapperParser, getMapperType } from './MapperParser'

export const IXmlMapperParserToken = new Token<IMapperParser>()

@Service(IXmlMapperParserToken)
class XmlMapperParser implements IMapperParser {
  isValid(doc: TextDocument): boolean {
    if (!doc) {
      return false
    }
    const text = doc.getText()
    return text.includes('DOCTYPE') && text.includes('mapper') && text.includes('mapper.dtd')
  }

  parse(document: TextDocument): Mapper | undefined {
    const xmlContent = document.getText()

    const matchedNamespce = xmlContent.match(/namespace="(.+)?"/)
    if (!matchedNamespce) {
      return
    }
    const namespace = matchedNamespce[1]

    const methods = findMethodDeclarations(document)

    const mapperType = getMapperType(document.uri.fsPath)

    if (!mapperType) {
      return
    }

    return {
      namespace,
      uri: document.uri,
      methods,
      type: mapperType,
      availableInsertPosition: document.positionAt(xmlContent.lastIndexOf('</mapper>'))
    }
  }
}

function findMethodDeclarations(document: TextDocument): Array<MethodDeclaration> {
  const text = document.getText()

  const rawMethods = text.match(/(<sql|<select|<insert|<update|<delete)[\s\n\r\S]+?id="[a-zA-Z_]+?"/g)

  if (!rawMethods) {
    return []
  }

  return rawMethods
    .filter((m): m is string => !!m)
    .map(m => {
      const matchedName = m.match(/id="(.+)?"/)
      if (!matchedName) {
        return
      }
      const startOffset = text.indexOf(matchedName[1])
      return {
        name: matchedName[1],
        startPosition: document.positionAt(startOffset),
        endPosition: document.positionAt(startOffset + matchedName[1].length)
      }
    })
    .filter((m): m is MethodDeclaration => !!m)
}
