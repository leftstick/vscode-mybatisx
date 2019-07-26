import * as vscode from 'vscode'
import * as glob from 'glob'
import { MapperStruct } from '../types/Codes'
import mapperService from '../helpers/XML'

export default class MybatisMapperXMLWatcher implements vscode.Disposable {
  private disposables: Array<vscode.Disposable> = []

  private mapperXMLs: Array<MapperStruct> = []

  constructor() {
    this.initWatch()
    this.initData()
  }

  public getMapperXMLs() {
    return this.mapperXMLs
  }

  private initWatch() {
    const { workspaceFolders } = vscode.workspace
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return
    }
    const workspaceFolderPaths = workspaceFolders.map(f => f.uri.fsPath)

    const pattern = `{${workspaceFolderPaths.join(',')}}/**/resources/**/*.xml`
    const watcher = vscode.workspace.createFileSystemWatcher(pattern, false, false, false)

    this.disposables.push(
      watcher.onDidCreate(async e => {
        await this.save(e)
        console.log(this.mapperXMLs)
      })
    )

    this.disposables.push(
      watcher.onDidChange(async e => {
        await this.save(e)
        console.log(this.mapperXMLs)
      })
    )
    this.disposables.push(
      watcher.onDidDelete(async e => {
        await this.remove(e)
        console.log(this.mapperXMLs)
      })
    )
  }

  private initData() {
    const { workspaceFolders } = vscode.workspace
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return
    }
    const workspaceFolderPaths = workspaceFolders.map(f => f.uri.fsPath)

    const pattern = `${workspaceFolderPaths.join(',')}/**/resources/**/*.xml`

    glob(pattern, (err, data) => {
      if (err) {
        return
      }

      Promise.all(data.map(d => vscode.Uri.file(d)).map(d => this.save(d))).catch(err => {
        console.error(err)
      })
    })
  }

  private async save(uri: vscode.Uri) {
    const doc = await vscode.workspace.openTextDocument(uri)

    try {
      if (!mapperService.isValid(doc)) {
        this.remove(uri)
        return
      }

      const mapper = mapperService.parse(doc)
      if (!mapper) {
        this.remove(uri)
        return
      }
      const found = this.mapperXMLs.find(m => m.uri.fsPath === uri.fsPath)

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
  }

  private remove(uri: vscode.Uri): void {
    this.mapperXMLs = this.mapperXMLs.filter(m => m.uri.fsPath !== uri.fsPath)
  }

  dispose() {
    this.disposables.forEach(d => {
      d.dispose()
    })
  }
}
