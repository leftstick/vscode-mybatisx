import * as glob from 'glob'
import { Uri, Disposable, workspace } from 'vscode'
import * as fs from 'fs'
import { TextDocument } from 'vscode'
import { Service, Token, Inject } from 'typedi'
import { Mapper } from '../types/Codes'
import { IMapperParser } from '../services/MapperParser'
import { IXmlMapperParserToken } from '../services/XmlMapperParser'

export interface IMybatisMapperXMLService {
  findXmlMapperByJavaMapper(jMapper: Mapper): Mapper | undefined
  findXmlMapperByUri(uri: Uri): Mapper | undefined
  initData(): Promise<void>
  dispose(): void
}

export const IMybatisMapperXMLServiceToken = new Token<IMybatisMapperXMLService>()

@Service(IMybatisMapperXMLServiceToken)
class MybatisMapperXMLService implements Disposable {
  private disposables: Array<Disposable> = []

  private mapperXMLs: Array<Mapper> = []

  private xmlMapperService: IMapperParser

  constructor(@Inject(IXmlMapperParserToken) xmlMapperService: IMapperParser) {
    this.xmlMapperService = xmlMapperService
    this.initWatch()
  }

  public findXmlMapperByJavaMapper(jMapper: Mapper) {
    return this.mapperXMLs.find(
      mapper => mapper.type === jMapper.type && mapper.namespace === jMapper.namespace
    )
  }

  public findXmlMapperByUri(uri: Uri) {
    return this.mapperXMLs.find(mapper => mapper.uri.fsPath === uri.fsPath)
  }

  private initWatch() {
    const { workspaceFolders } = workspace
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return
    }
    const workspaceFolderPaths = workspaceFolders.map(f => f.uri.fsPath)

    const pattern = `{${workspaceFolderPaths.join(',')}}/**/*.xml`
    const watcher = workspace.createFileSystemWatcher(pattern, false, false, false)

    this.disposables.push(
      watcher.onDidCreate(async e => {
        await this.save(e)
      })
    )

    this.disposables.push(
      watcher.onDidChange(async e => {
        await this.save(e)
      })
    )
    this.disposables.push(
      watcher.onDidDelete(async e => {
        await this.remove(e)
      })
    )

    this.disposables.push(watcher)
  }

  public initData(): Promise<void> {
    const { workspaceFolders } = workspace
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return Promise.resolve()
    }
    const workspaceFolderPaths = workspaceFolders.map(f => f.uri.fsPath)

    const pattern = `${workspaceFolderPaths.join(',')}/**/src/**/resources/**/*.xml`

    return new Promise((resolve, reject) => {
      glob(pattern, (err, data) => {
        if (err) {
          return reject(err)
        }

        data.map(d => Uri.file(d)).map(d => this.save(d))
        resolve()
      })
    })
  }

  private async save(uri: Uri) {
    console.log('path==============>' + uri.path)
    workspace.openTextDocument(uri).then(doc => {
      try {
        if (!this.xmlMapperService.isValid(doc)) {
          return this.remove(uri)
        }

        const mapper = this.xmlMapperService.parse(doc)
        if (!mapper) {
          return this.remove(uri)
        }

        const found = this.mapperXMLs.find(m => m.uri.fsPath === uri.path)

        if (!found) {
          this.mapperXMLs.push(mapper)
        } else {
          this.mapperXMLs = this.mapperXMLs.map(m => {
            if (m.uri.fsPath === uri.fsPath) {
              return mapper
            }
            return m
          })
        }
      } catch (error) {
        this.remove(uri)
      }
    })
  }

  private remove(uri: Uri): void {
    this.mapperXMLs = this.mapperXMLs.filter(m => m.uri.fsPath !== uri.fsPath)
  }

  dispose() {
    this.disposables.forEach(d => {
      d.dispose()
    })
  }
}
