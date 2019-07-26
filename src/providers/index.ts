import { languages } from 'vscode'
import { Container } from 'typedi'
import { IJavaMapperCodeLensToken } from './JavaMapperCodeLens'
import { IXmlMapperDefinitionProviderToken } from './XmlMapperDefinitionProvider'

export function registerCodeLensProvider() {
  return languages.registerCodeLensProvider(
    {
      scheme: 'file',
      language: 'java'
    },
    Container.get(IJavaMapperCodeLensToken)
  )
}

export function registerDefinitionProvider() {
  return languages.registerDefinitionProvider(
    {
      scheme: 'file',
      language: 'xml'
    },
    Container.get(IXmlMapperDefinitionProviderToken)
  )
}
