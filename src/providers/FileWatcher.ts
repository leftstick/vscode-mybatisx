import * as vscode from 'vscode'

export async function getMybatisMapperXMLWatcher() {
  const { workspaceFolders } = vscode.workspace
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null
  }
  const workspaceFolderPaths = workspaceFolders.map(f => f.uri.fsPath)

  const pattern = `{${workspaceFolderPaths.join(',')}}/**/*.xml`
  return vscode.workspace.createFileSystemWatcher(pattern, false, false, false)
}
