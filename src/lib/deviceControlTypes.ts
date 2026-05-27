import type { DeviceInfo, DeviceState, InstalledApp } from '../adapters/deviceTypes'
import type { AgentAction } from './actionTypes'
import type { BusyTask } from './busyTask'
import type { DoctorCheckResult } from './deviceDoctor'

export type DeviceControlState = {
  busyTask: BusyTask | null
  connected: boolean
  currentApp: string
  deviceInfo: DeviceInfo | null
  doctorResults: DoctorCheckResult[]
  deviceState: DeviceState
  installedApps: InstalledApp[]
}

export type DeviceControlOptions = {
  actionSettleMs: number
  confirmSensitiveActions: boolean
  doubleTapIntervalMs: number
  keyboardStepMs: number
  preferAdbKeyboard: boolean
  unrestrictedMode: boolean
}

export type DeviceControlActions = {
  onActionSettleMsChange: (value: number) => void
  onCaptureScreen: () => void
  onConfirmSensitiveActionsChange: (value: boolean) => void
  onConfigureAdbKeyboard: () => void
  onConnectDevice: () => void
  onDisconnectDevice: () => void
  onDoubleTapIntervalMsChange: (value: number) => void
  onKeyboardStepMsChange: (value: number) => void
  onLaunchInstalledApp: (app: InstalledApp) => void
  onPreferAdbKeyboardChange: (value: boolean) => void
  onRunDirectAction: (action: AgentAction) => void
  onRunDoctor: () => void
  onUnrestrictedModeChange: (value: boolean) => void
}
