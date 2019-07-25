import * as vscode from 'vscode'
import GotoDefinitionCodeLens from './GotoDefinitionCodeLens'

export function registerCodeLensProvider() {
  return vscode.languages.registerCodeLensProvider(
    {
      scheme: 'file',
      language: 'java'
    },
    new GotoDefinitionCodeLens()
  )
}
