import { CodeLensProvider, TextDocument, CodeLens, Range, Command, Position } from 'vscode'
import { MethodDeclaration } from '../types/Codes'
import { isValidMyBatisMapperImpl, findMethodDeclarations } from '../helpers/Java'

export default class GotoDefinitionCodeLens implements CodeLensProvider {
  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    // not valid BaseMapper implementation
    if (!isValidMyBatisMapperImpl(document.getText())) {
      return []
    }

    const methods = findMethodDeclarations(document)

    return methods
      .map(m => {
        const cmd: Command = {
          command: 'extension.open',
          title: 'Go to Mapper XML'
        }
        const range = document.getWordRangeAtPosition(m.position)
        if (!range) {
          return null
        }
        return new CodeLens(range, cmd)
      })
      .filter((p): p is CodeLens => !!p)
  }
}
