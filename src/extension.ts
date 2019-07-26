// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import { registerCodeLensProvider } from './providers'
import MybatisMapperXMLWatcher from './providers/MybatisMapperXMLWatcher'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-mybatisx" is now active!')

  const mybatisMapperXMLWatcher = new MybatisMapperXMLWatcher()
  context.subscriptions.push(registerCodeLensProvider(mybatisMapperXMLWatcher))
  context.subscriptions.push(mybatisMapperXMLWatcher)
}

// this method is called when your extension is deactivated
export function deactivate() {}
