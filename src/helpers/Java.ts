import { TextDocument } from 'vscode'
import { MethodDeclaration } from '../types/Codes'

export function isValidMyBatisMapperImpl(code: string) {
  return /(interface|class).+extends\s+BaseMapper/.test(code)
}

export function findMethodDeclarations(document: TextDocument): Array<MethodDeclaration> {
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
