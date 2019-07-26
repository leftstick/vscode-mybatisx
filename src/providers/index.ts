import * as vscode from 'vscode'
import GotoDefinitionCodeLens from './GotoDefinitionCodeLens'
import MybatisMapperXMLWatcher from '../providers/MybatisMapperXMLWatcher'

export function registerCodeLensProvider(mybatisMapperXMLWatcher: MybatisMapperXMLWatcher) {
  return vscode.languages.registerCodeLensProvider(
    {
      scheme: 'file',
      language: 'java'
    },
    new GotoDefinitionCodeLens(mybatisMapperXMLWatcher)
  )
}
