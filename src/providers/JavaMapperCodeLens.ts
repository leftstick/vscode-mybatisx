import { CodeLensProvider, TextDocument, CodeLens, Range, Command, Position, Uri } from 'vscode'
import { Inject, Token, Service } from 'typedi'
import { MethodDeclaration, Mapper } from '../types/Codes'
import { IMapperParser } from '../services/MapperParser'
import { IJavaMapperParserToken } from '../services/JavaMapperParser'
import { IMybatisMapperXMLServiceToken, IMybatisMapperXMLService } from '../services/MybatisMapperXMLService'

export const IJavaMapperCodeLensToken = new Token<CodeLensProvider>()

@Service(IJavaMapperCodeLensToken)
class JavaMapperCodeLens implements CodeLensProvider {
  private mybatisMapperXMLService: IMybatisMapperXMLService
  private javaMapperParserService: IMapperParser

  constructor(
    @Inject(IMybatisMapperXMLServiceToken) mybatisMapperXMLService: IMybatisMapperXMLService,
    @Inject(IJavaMapperParserToken) javaMapperParserService: IMapperParser
  ) {
    this.mybatisMapperXMLService = mybatisMapperXMLService
    this.javaMapperParserService = javaMapperParserService
  }

  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    // not valid BaseMapper implementation
    if (!this.javaMapperParserService.isValid(document)) {
      return []
    }

    const jMapper = this.javaMapperParserService.parse(document)

    if (!jMapper) {
      return []
    }

    return jMapper.methods
      .map(jMethod => {
        const xmlMapper = this.mybatisMapperXMLService.findXmlMapperByJavaMapper(jMapper)
        if (!xmlMapper) {
          return null
        }
        return this.createCodeLens(document, xmlMapper, jMethod)
      })
      .filter((p): p is CodeLens => !!p)
  }

  private createCodeLens(document: TextDocument, xmlMapper: Mapper, jMethod: MethodDeclaration) {
    const cmd = this.createCommand(xmlMapper, jMethod)
    const range = document.getWordRangeAtPosition(jMethod.startPosition)
    if (!range) {
      return null
    }
    return new CodeLens(range, cmd)
  }

  private createCommand(xmlMapper: Mapper, jMethod: MethodDeclaration) {
    const foundMethodDeclaration = xmlMapper.methods.find(m => m.name === jMethod.name)
    if (foundMethodDeclaration) {
      return this.createGotoCommand(xmlMapper.uri, foundMethodDeclaration)
    }
    return this.createNewSectionCommand(xmlMapper, jMethod)
  }

  private createNewSectionCommand(xmlMapper: Mapper, jMethod: MethodDeclaration) {
    return {
      command: 'mybatisx.open_and_add_new_section',
      title: 'Create in Mapper xml',
      arguments: [
        xmlMapper.uri,
        xmlMapper.availableInsertPosition,
        `
    <sql id="${jMethod.name}">
          
    </sql>

`
      ]
    }
  }

  private createGotoCommand(uri: Uri, xmlMethod: MethodDeclaration) {
    return {
      command: 'vscode.open',
      title: 'Go to Mapper xml',
      tooltip: 'will open specific .xml file',
      arguments: [
        uri,
        {
          selection: new Range(xmlMethod.startPosition, xmlMethod.endPosition)
        }
      ]
    }
  }
}
