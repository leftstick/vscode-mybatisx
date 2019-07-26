import { window, workspace, commands, Uri, Position } from 'vscode'

export function registerXmlMapperCmd() {
  return commands.registerCommand(
    'mybatisx.open_and_add_new_section',
    async (uri: Uri, position: Position, content: string) => {
      if (!uri || !position || !content) {
        return
      }

      const doc = await workspace.openTextDocument(uri)
      const editor = await window.showTextDocument(doc)
      editor.edit(editBuilder => {
        editBuilder.replace(position, content)
      })
    }
  )
}
