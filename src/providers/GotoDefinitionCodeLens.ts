import { CodeLensProvider, TextDocument, CodeLens, Range, Command, Position } from 'vscode'
import { MethodDeclaration } from '../types/Codes'
import mapperService from '../helpers/Java'
import MybatisMapperXMLWatcher from './MybatisMapperXMLWatcher'

export default class GotoDefinitionCodeLens implements CodeLensProvider {
  private mybatisMapperXMLWatcher: MybatisMapperXMLWatcher

  constructor(mybatisMapperXMLWatcher: MybatisMapperXMLWatcher) {
    this.mybatisMapperXMLWatcher = mybatisMapperXMLWatcher
  }

  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    // not valid BaseMapper implementation
    if (!mapperService.isValid(document)) {
      return []
    }

    const struct = mapperService.parse(document)

    if (!struct) {
      return []
    }

    return struct.methods
      .map(m => {
        const mapper = this.mybatisMapperXMLWatcher
          .getMapperXMLs()
          .find(mapper => mapper.type === struct.type && mapper.namespace === struct.namespace)
        if (!mapper) {
          return null
        }
        const cmd: Command = {
          command: 'vscode.open',
          title: 'Go to Mapper XML',
          tooltip: 'will open specific .xml file',
          arguments: [mapper.uri]
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
