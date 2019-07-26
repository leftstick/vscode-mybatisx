import {
  DefinitionProvider,
  TextDocument,
  CodeLens,
  Range,
  Position,
  Uri,
  ProviderResult,
  Definition,
  DefinitionLink,
  workspace
} from 'vscode'
import { Inject, Token, Service } from 'typedi'
import { IMapperParser, getFsPathBasedOnMapperType } from '../services/MapperParser'
import { IMybatisMapperXMLServiceToken, IMybatisMapperXMLService } from '../services/MybatisMapperXMLService'
import { IJavaMapperParserToken } from '../services/JavaMapperParser'
import { getQuoteRange } from '../helpers/StringUtils'
import { Mapper } from '../types/Codes'

export const IXmlMapperDefinitionProviderToken = new Token<DefinitionProvider>()

@Service(IXmlMapperDefinitionProviderToken)
class XmlMapperDefinitionProvider implements DefinitionProvider {
  private mybatisMapperXMLService: IMybatisMapperXMLService
  private javaMapperParserService: IMapperParser

  constructor(
    @Inject(IMybatisMapperXMLServiceToken) mybatisMapperXMLService: IMybatisMapperXMLService,
    @Inject(IJavaMapperParserToken) javaMapperParserService: IMapperParser
  ) {
    this.mybatisMapperXMLService = mybatisMapperXMLService
    this.javaMapperParserService = javaMapperParserService
  }

  provideDefinition(
    document: TextDocument,
    position: Position
  ): ProviderResult<Definition | DefinitionLink[]> {
    // not valid xmlMapper implementation
    const xmlMapper = this.mybatisMapperXMLService.findXmlMapperByUri(document.uri)
    if (!xmlMapper) {
      return Promise.resolve([])
    }

    const range = getQuoteRange(document, position)

    if (!range) {
      return Promise.resolve([])
    }

    const words = document.getText(
      new Range(
        document.positionAt(document.offsetAt(range.start) - 10),
        document.positionAt(document.offsetAt(range.start) - 1)
      )
    )

    if (words !== 'namespace') {
      return Promise.resolve([])
    }

    return this.createJavaSourceByNamespace(xmlMapper, range)
  }

  private async createJavaSourceByNamespace(xmlMapper: Mapper, originSelectionRange: Range) {
    const classPath = xmlMapper.namespace.replace(/\./g, '/')

    const basePath = getFsPathBasedOnMapperType(xmlMapper.uri.fsPath)
    console.log('basePath', `${basePath}/java/${classPath}.java`)

    const targetUri = Uri.file(`${basePath}/java/${classPath}.java`)
    try {
      const javaDoc = await workspace.openTextDocument(targetUri)

      return [
        {
          originSelectionRange,
          targetUri,
          targetRange: new Range(javaDoc.positionAt(0), javaDoc.positionAt(javaDoc.getText().length))
        }
      ]
    } catch (error) {
      return []
    }

    return []
  }
}
