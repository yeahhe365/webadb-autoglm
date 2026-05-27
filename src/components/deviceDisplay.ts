import { UNKNOWN_APP_NAME } from '../lib/deviceState'
import type { AppCopy } from '../lib/appCopy'

export function formatCurrentAppLabel(currentApp: string, copy: AppCopy) {
  return currentApp === UNKNOWN_APP_NAME ? copy.unknownApp : currentApp
}
