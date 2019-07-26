import { Position, TextDocument, Range } from 'vscode'

export function getQuoteRange(document: TextDocument, position: Position) {
  const offset = document.offsetAt(position)
  if (outOfRange(document, offset)) {
    return null
  }
  const startOfLint = document.offsetAt(new Position(position.line, 0))
  const endOfLint = document.offsetAt(new Position(position.line, Infinity))

  let frontQuoteOffset: number | undefined

  for (let i = offset - 1; i >= startOfLint; i--) {
    if (CharAt(document, i) === '"') {
      frontQuoteOffset = i
      break
    }
  }

  if (!isNotUndefined(frontQuoteOffset)) {
    return null
  }

  let endQuoteOffset: number | undefined
  for (let i = offset; i <= endOfLint; i++) {
    if (CharAt(document, i) === '"') {
      endQuoteOffset = i
      break
    }
  }

  if (!isNotUndefined(endQuoteOffset)) {
    return null
  }

  return new Range(document.positionAt(frontQuoteOffset), document.positionAt(endQuoteOffset + 1))
}

export function isNotUndefined<T>(data: T | undefined): data is T {
  return data !== undefined
}

function outOfRange(document: TextDocument, offset: number) {
  const illegal = document.validatePosition(new Position(Infinity, Infinity))
  return document.positionAt(offset).isEqual(illegal)
}

function CharAt(document: TextDocument, offset: number): string {
  if (outOfRange(document, offset)) {
    throw new Error('illegal offset')
  }
  return document.getText(new Range(document.positionAt(offset), document.positionAt(offset + 1)))
}
