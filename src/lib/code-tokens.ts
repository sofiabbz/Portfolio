// Tokenizador puro do editor auto-digitado. Recebe o texto VISÍVEL (que pode
// terminar no meio de uma string ou palavra) e devolve uma lista de tokens
// cuja concatenação é exatamente o texto de entrada — nenhum caractere se perde.
// Sem DOM, sem React: fácil de testar.

export type TokenKind = 'keyword' | 'type' | 'string' | 'brace' | 'punct' | 'text'

export interface Token {
  kind: TokenKind
  value: string
}

const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'type', 'interface'])
const TYPES = new Set(['Dev', 'string', 'number', 'boolean'])
const BRACES = new Set(['{', '}', '[', ']', '(', ')'])
const PUNCT = new Set([':', ';', ',', '=', '.'])

function isWordChar(ch: string): boolean {
  return /[\p{L}\p{N}_$]/u.test(ch)
}

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  const push = (kind: TokenKind, value: string) => {
    if (value.length === 0) return
    const last = tokens[tokens.length - 1]
    // Junta tokens vizinhos do mesmo tipo para gerar menos spans
    if (last && last.kind === kind && kind === 'text') {
      last.value += value
    } else {
      tokens.push({ kind, value })
    }
  }

  while (i < source.length) {
    const ch = source.charAt(i)

    // String: do " até o próximo " ou até o fim do texto (string ainda sendo digitada)
    if (ch === '"') {
      let j = i + 1
      while (j < source.length && source.charAt(j) !== '"') j += 1
      const closed = j < source.length
      const end = closed ? j + 1 : j
      push('string', source.slice(i, end))
      i = end
      continue
    }

    if (BRACES.has(ch)) {
      push('brace', ch)
      i += 1
      continue
    }

    if (PUNCT.has(ch)) {
      push('punct', ch)
      i += 1
      continue
    }

    if (isWordChar(ch)) {
      let j = i
      while (j < source.length && isWordChar(source.charAt(j))) j += 1
      const word = source.slice(i, j)
      if (KEYWORDS.has(word)) push('keyword', word)
      else if (TYPES.has(word)) push('type', word)
      else push('text', word)
      i = j
      continue
    }

    // Espaços, quebras de linha e qualquer outro caractere passam como texto
    push('text', ch)
    i += 1
  }

  return tokens
}

/** Quebra o texto em linhas, tokenizando cada uma separadamente. */
export function tokenizeLines(source: string): Token[][] {
  return source.split('\n').map((line) => tokenize(line))
}
