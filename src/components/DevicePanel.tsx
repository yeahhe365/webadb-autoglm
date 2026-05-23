import {
  CircleHelp,
  CircleStop,
  Download,
  KeyRound,
  Link,
  ScanEye,
  Stethoscope,
  Usb,
} from 'lucide-react'
import {
  type DeviceInfo,
  type DeviceState,
  type InstalledApp,
} from '../adapters/deviceTypes'
import type { AgentAction } from '../lib/actionTypes'
import type { AppCopy } from '../lib/appCopy'
import type { BusyTask } from '../lib/busyTask'
import type { DoctorCheckResult } from '../lib/deviceDoctor'
import { DeviceOptionsSection } from './DeviceOptionsSection'
import { DirectCommandsSection } from './DirectCommandsSection'
import { InstalledAppsSection } from './InstalledAppsSection'

export type DevicePanelProps = {
  actionSettleMs: number
  busyTask: BusyTask | null
  confirmSensitiveActions: boolean
  connected: boolean
  copy: AppCopy
  currentApp: string
  deviceInfo: DeviceInfo | null
  doctorResults: DoctorCheckResult[]
  deviceState: DeviceState
  doubleTapIntervalMs: number
  installedApps: InstalledApp[]
  keyboardStepMs: number
  preferAdbKeyboard: boolean
  onActionSettleMsChange: (value: number) => void
  onCaptureScreen: () => void
  onConfirmSensitiveActionsChange: (value: boolean) => void
  onConnectDevice: () => void
  onDisconnectDevice: () => void
  onDoubleTapIntervalMsChange: (value: number) => void
  onEnableAdbKeyboard: () => void
  onInstallAdbKeyboard: () => void
  onKeyboardStepMsChange: (value: number) => void
  onLaunchInstalledApp: (app: InstalledApp) => void
  onPreferAdbKeyboardChange: (value: boolean) => void
  onRunDirectAction: (action: AgentAction) => void
  onRunDoctor: () => void
}

export function DevicePanel({
  actionSettleMs,
  busyTask,
  confirmSensitiveActions,
  connected,
  copy,
  currentApp,
  deviceInfo,
  doctorResults,
  deviceState,
  doubleTapIntervalMs,
  installedApps,
  keyboardStepMs,
  onActionSettleMsChange,
  onCaptureScreen,
  onConfirmSensitiveActionsChange,
  onConnectDevice,
  onDisconnectDevice,
  onDoubleTapIntervalMsChange,
  onEnableAdbKeyboard,
  onInstallAdbKeyboard,
  onKeyboardStepMsChange,
  onLaunchInstalledApp,
  onPreferAdbKeyboardChange,
  onRunDirectAction,
  onRunDoctor,
  preferAdbKeyboard,
}: DevicePanelProps) {
  const isBusy = Boolean(busyTask)

  return (
    <>
      <div className="panel-title">
        <Usb size={18} />
        <h2>{copy.device}</h2>
      </div>
      <div className="device-box">
        <span>{deviceInfo?.name || copy.noDevice}</span>
        {connected && deviceInfo ? (
          <details className="device-details">
            <summary>{copy.deviceDetails}</summary>
            <small>{copy.serial}: {deviceInfo.serial}</small>
            <small>{copy.currentApp}: {currentApp}</small>
            {deviceState.packageName ? (
              <small>{copy.package}: {deviceState.packageName}</small>
            ) : null}
            {deviceState.activity ? <small>{copy.activity}: {deviceState.activity}</small> : null}
            {deviceState.keyboard ? <small>{copy.keyboard}: {deviceState.keyboard}</small> : null}
          </details>
        ) : (
          <>
            <small>{copy.usbDebuggingRequired}</small>
            <small>{copy.currentApp}: {currentApp}</small>
          </>
        )}
      </div>
      <div className="adb-connect-row">
        <div className="button-row">
          <button type="button" onClick={onConnectDevice} disabled={isBusy || connected}>
            <Link size={16} />
            {copy.connect}
          </button>
          <button type="button" onClick={onDisconnectDevice} disabled={isBusy || !connected}>
            <CircleStop size={16} />
            {copy.disconnect}
          </button>
        </div>
        <span className="adb-help">
          <button
            type="button"
            className="icon-button adb-help-trigger"
            aria-label={copy.adbConnectionHelpLabel}
            aria-describedby="adb-connection-help"
            title={copy.adbConnectionHelpText}
          >
            <CircleHelp size={16} />
          </button>
          <span className="adb-help-tooltip" id="adb-connection-help" role="tooltip">
            {copy.adbConnectionHelpText}
          </span>
        </span>
      </div>
      <button
        type="button"
        className="wide"
        onClick={onCaptureScreen}
        disabled={isBusy || !connected}
      >
        <ScanEye size={16} />
        {copy.capture}
      </button>
      <button
        type="button"
        className="wide"
        onClick={onInstallAdbKeyboard}
        disabled={isBusy || !connected}
      >
        <Download size={16} />
        {copy.installAdbKeyboard}
      </button>
      <button
        type="button"
        className="wide"
        onClick={onEnableAdbKeyboard}
        disabled={isBusy || !connected}
      >
        <KeyRound size={16} />
        {copy.enableAdbKeyboard}
      </button>
      <button type="button" className="wide" onClick={onRunDoctor} disabled={isBusy}>
        <Stethoscope size={16} />
        {copy.runDoctor}
      </button>
      <InstalledAppsSection
        busyTask={busyTask}
        connected={connected}
        copy={copy}
        installedApps={installedApps}
        onLaunchInstalledApp={onLaunchInstalledApp}
      />
      <DirectCommandsSection
        busyTask={busyTask}
        connected={connected}
        copy={copy}
        onRunDirectAction={onRunDirectAction}
      />
      {doctorResults.length > 0 ? (
        <details className="compact-section">
          <summary>{copy.doctorChecks}</summary>
          <section className="doctor-results" aria-label={copy.doctorChecks}>
            <div className="doctor-check-list">
              {doctorResults.map((result) => (
                <article className={`doctor-check ${result.status}`} key={result.id}>
                  <span>{result.status.toUpperCase()}</span>
                  <div>
                    <strong>{result.title}</strong>
                    <p>{result.detail}</p>
                    {result.fix ? <small>{result.fix}</small> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </details>
      ) : null}
      <DeviceOptionsSection
        actionSettleMs={actionSettleMs}
        confirmSensitiveActions={confirmSensitiveActions}
        copy={copy}
        doubleTapIntervalMs={doubleTapIntervalMs}
        keyboardStepMs={keyboardStepMs}
        onActionSettleMsChange={onActionSettleMsChange}
        onConfirmSensitiveActionsChange={onConfirmSensitiveActionsChange}
        onDoubleTapIntervalMsChange={onDoubleTapIntervalMsChange}
        onKeyboardStepMsChange={onKeyboardStepMsChange}
        onPreferAdbKeyboardChange={onPreferAdbKeyboardChange}
        preferAdbKeyboard={preferAdbKeyboard}
      />
    </>
  )
}
