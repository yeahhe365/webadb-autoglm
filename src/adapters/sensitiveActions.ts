import type { AgentAction } from '../lib/actionTypes'
import { throwIfAborted, withAbort } from '../lib/abortSignal'
import { DeviceBackendError, type ExecuteActionOptions } from './deviceTypes'

export function getSensitiveActionMessage(action: AgentAction): string | null {
  if (action.action !== 'tap') {
    return null
  }

  if (action.message) {
    return action.message
  }

  if (action.risk === 'sensitive') {
    return `Sensitive tap at (${action.x}, ${action.y})`
  }

  return null
}

export async function assertSensitiveActionConfirmed(
  action: AgentAction,
  options?: ExecuteActionOptions,
) {
  throwIfAborted(options?.signal)
  const message = getSensitiveActionMessage(action)
  if (!message) {
    return
  }

  const confirmed = options?.confirmSensitiveAction
    ? await withAbort(Promise.resolve(options.confirmSensitiveAction(message, action)), options.signal)
    : false
  throwIfAborted(options?.signal)

  if (!confirmed) {
    throw new DeviceBackendError(`Sensitive action blocked: ${message}`)
  }
}
