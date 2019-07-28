import { window, workspace, commands, Uri, Position, Range, TextEditorRevealType } from 'vscode'

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
        editBuilder.insert(position, content)
        setTimeout(() => {
          editor.revealRange(
            new Range(position, doc.positionAt(doc.getText().length)),
            TextEditorRevealType.AtTop
          )
        }, 100)
      })
    }
  )
}
