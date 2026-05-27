import { canonicalActionName, normalizeActionName } from './actionAliases'
import { ActionValidationError } from './actionTypes'

export function parseActionCandidate(raw: string): unknown {
  const xmlCandidate = parseMobilerunXmlToolCalls(raw)
  if (xmlCandidate) {
    return xmlCandidate
  }

  try {
    return JSON.parse(extractJsonObject(raw))
  } catch {
    const functionCandidate = parseFunctionLikeAction(raw)
    if (!functionCandidate) {
      throw new ActionValidationError('Model response did not contain valid action JSON.')
    }
    return functionCandidate
  }
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const body = fenced?.[1]?.trim() ?? trimmed
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new ActionValidationError('Model response did not contain a JSON object.')
  }

  return body.slice(start, end + 1)
}

function parseFunctionLikeAction(raw: string): Record<string, unknown> | null {
  const cleaned = raw.replace(/<\/?answer>/gi, '').trim()
  const match = cleaned.match(/\b([A-Za-z_]\w*)\s*\(([\s\S]*?)\)/)
  if (!match) {
    return null
  }

  const functionName = normalizeActionName(match[1])
  const args = parseFunctionArguments(match[2])
  if (functionName === 'finish') {
    const summary =
      typeof args.message === 'string' && args.message.trim()
        ? args.message.trim()
        : typeof args.summary === 'string' && args.summary.trim()
          ? args.summary.trim()
          : undefined
    return summary ? { action: 'done', summary } : { action: 'done' }
  }

  if (functionName !== 'do' && functionName !== 'action' && typeof args.action !== 'string') {
    return { action: canonicalActionName(functionName), ...args }
  }

  return args
}

function parseMobilerunXmlToolCalls(raw: string): Record<string, unknown> | null {
  const invokes = [...raw.matchAll(/<invoke\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/invoke>/gi)]
  if (invokes.length === 0) {
    return null
  }

  const actions = invokes.map((invoke) => parseMobilerunXmlInvoke(invoke[1], invoke[2]))
  return actions.length === 1 ? actions[0] : { action: 'sequence', actions }
}

function parseMobilerunXmlInvoke(name: string, body: string): Record<string, unknown> {
  const result: Record<string, unknown> = {
    action: decodeXmlText(name),
  }
  const parameterPattern =
    /<parameter\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/parameter>/gi
  let parameter: RegExpExecArray | null
  while ((parameter = parameterPattern.exec(body)) !== null) {
    result[decodeXmlText(parameter[1])] = parseXmlParameterValue(parameter[2])
  }
  return result
}

function parseXmlParameterValue(raw: string): unknown {
  const value = decodeXmlText(raw.trim())
  if (!value) {
    return ''
  }
  if (/^(true|false)$/i.test(value)) {
    return value.toLowerCase() === 'true'
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }
  if (
    (value.startsWith('[') && value.endsWith(']')) ||
    (value.startsWith('{') && value.endsWith('}'))
  ) {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

function decodeXmlText(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseFunctionArguments(args: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const pattern = /(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\[[^\]]*\]|[^,]+)/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(args)) !== null) {
    result[match[1]] = parseFunctionValue(match[2].trim())
  }

  return result
}

function parseFunctionValue(value: string): unknown {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((part) => parseFunctionValue(part.trim()))
  }

  if (/^(true|false)$/i.test(value)) {
    return value.toLowerCase() === 'true'
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value)
  }

  return value
}
