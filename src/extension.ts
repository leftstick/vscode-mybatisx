// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import 'reflect-metadata'
import { window, ExtensionContext } from 'vscode'
import { Container } from 'typedi'
import { registerCodeLensProvider, registerDefinitionProvider } from './providers'
import { registerXmlMapperCmd } from './commands'
import { IMybatisMapperXMLServiceToken } from './services/MybatisMapperXMLService'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-mybatisx" is now active!')

  const mybatisMapperXMLService = Container.get(IMybatisMapperXMLServiceToken)

  const hideFunc = window.setStatusBarMessage('mybatisx initializing....')

  mybatisMapperXMLService.initData().then(() => {
    hideFunc.dispose()

    context.subscriptions.push(registerXmlMapperCmd())
    context.subscriptions.push(registerCodeLensProvider())
    context.subscriptions.push(registerDefinitionProvider())

    context.subscriptions.push(mybatisMapperXMLService)
  })
}

// this method is called when your extension is deactivated
export function deactivate() {}
