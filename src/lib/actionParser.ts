import { parseActionCandidate } from './actionFormats'
import { validateAction } from './actionValidation'
import type { AgentAction, ScreenSize } from './actionTypes'

export function parseModelAction(raw: string, screen?: ScreenSize): AgentAction {
  return validateAction(parseActionCandidate(raw), screen)
}

export { validateAction }
