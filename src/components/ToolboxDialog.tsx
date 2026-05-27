import {
  AppWindow,
  Circle,
  ClipboardCheck,
  Keyboard,
  LoaderCircle,
  Settings2,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { AppCopy } from '../lib/appCopy'
import type {
  DeviceControlActions,
  DeviceControlOptions,
  DeviceControlState,
} from '../lib/deviceControlTypes'
import { DeviceOptionsSection } from './DeviceOptionsSection'
import { InstalledAppsSection } from './InstalledAppsSection'
import { formatCurrentAppLabel } from './deviceDisplay'

type ToolboxDialogProps = {
  actions: DeviceControlActions
  copy: AppCopy
  onClose: () => void
  options: DeviceControlOptions
  state: DeviceControlState
}

const TOOLBOX_ACTION_CARD_CLASS = 'toolbox-card toolbox-action-card'
const TOOLBOX_SECTION_CARD_CLASS = 'compact-section toolbox-card'

export function ToolboxDialog({
  actions,
  copy,
  onClose,
  options,
  state,
}: ToolboxDialogProps) {
  const isBusy = Boolean(state.busyTask)
  const currentAppLabel = formatCurrentAppLabel(state.currentApp, copy)

  return (
    <div
      className="toolbox-page"
      role="dialog"
      aria-modal="true"
      aria-label={copy.toolbox}
      onClick={onClose}
    >
      <section className="toolbox-panel" onClick={(event) => event.stopPropagation()}>
        <div className="toolbox-header">
          <div>
            <p className="eyebrow">{copy.tools}</p>
            <h2>{copy.toolbox}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={copy.closeToolbox}
            title={copy.closeToolbox}
          >
            <X size={16} />
          </button>
        </div>

        <section className="toolbox-card-grid" aria-label={copy.tools}>
          <button
            type="button"
            className={TOOLBOX_ACTION_CARD_CLASS}
            onClick={actions.onConfigureAdbKeyboard}
            disabled={isBusy || !state.connected}
            title={
              isBusy
                ? copy.waitForCurrentRun
                : state.connected
                  ? copy.configureTextInput
                  : copy.noDevice
            }
          >
            <ToolboxCardTitle icon={Keyboard} label={copy.configureTextInput} />
          </button>
          <button
            type="button"
            className={TOOLBOX_ACTION_CARD_CLASS}
            onClick={actions.onRunDoctor}
            disabled={isBusy}
            title={isBusy ? copy.waitForCurrentRun : copy.runDoctor}
          >
            <ToolboxCardTitle icon={ClipboardCheck} label={copy.runDoctor} />
          </button>
        </section>

        <ToolboxDoctorResults copy={copy} results={state.doctorResults} />

        <InstalledAppsSection
          busyTask={state.busyTask}
          className={TOOLBOX_SECTION_CARD_CLASS}
          connected={state.connected}
          copy={copy}
          installedApps={state.installedApps}
          onLaunchInstalledApp={actions.onLaunchInstalledApp}
          summary={<ToolboxCardTitle icon={AppWindow} label={copy.installedApps} />}
        />
        <DeviceOptionsSection
          actionSettleMs={options.actionSettleMs}
          className={TOOLBOX_SECTION_CARD_CLASS}
          copy={copy}
          doubleTapIntervalMs={options.doubleTapIntervalMs}
          keyboardStepMs={options.keyboardStepMs}
          onActionSettleMsChange={actions.onActionSettleMsChange}
          onDoubleTapIntervalMsChange={actions.onDoubleTapIntervalMsChange}
          onKeyboardStepMsChange={actions.onKeyboardStepMsChange}
          summary={<ToolboxCardTitle icon={Settings2} label={copy.deviceOptions} />}
        />
        <div className="toolbox-footer">
          <ToolboxStatusChip
            icon={Wrench}
            tone={state.connected ? 'ok' : 'idle'}
            label={
              state.connected ? (state.deviceInfo?.name ?? copy.deviceConnected) : copy.noDevice
            }
          />
          <ToolboxStatusChip
            icon={AppWindow}
            tone="idle"
            label={`${copy.currentApp}: ${currentAppLabel}`}
          />
          {state.busyTask ? (
            <ToolboxStatusChip icon={LoaderCircle} tone="busy" label={state.busyTask.label} />
          ) : null}
        </div>
      </section>
    </div>
  )
}

type ToolboxCardTitleProps = {
  icon: LucideIcon
  label: string
}

function ToolboxCardTitle({ icon: Icon, label }: ToolboxCardTitleProps) {
  return (
    <span className="toolbox-card-title">
      <span className="toolbox-card-icon">
        <Icon size={17} />
      </span>
      <span className="toolbox-card-label">{label}</span>
    </span>
  )
}

type ToolboxStatusChipProps = {
  icon: LucideIcon
  label: string
  tone: 'busy' | 'idle' | 'ok'
}

function ToolboxStatusChip({ icon: Icon, label, tone }: ToolboxStatusChipProps) {
  return (
    <span className={`toolbox-status-chip ${tone}`}>
      <Icon size={14} />
      <span>{label}</span>
      <Circle className="toolbox-status-dot" size={8} fill="currentColor" strokeWidth={0} />
    </span>
  )
}

type ToolboxDoctorResultsProps = {
  copy: AppCopy
  results: DeviceControlState['doctorResults']
}

function ToolboxDoctorResults({ copy, results }: ToolboxDoctorResultsProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <details className={TOOLBOX_SECTION_CARD_CLASS} open>
      <summary>
        <ToolboxCardTitle icon={ClipboardCheck} label={copy.doctorChecks} />
      </summary>
      <section className="doctor-results" aria-label={copy.doctorChecks}>
        <div className="doctor-check-list">
          {results.map((result) => (
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
  )
}
