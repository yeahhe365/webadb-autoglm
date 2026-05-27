import { Settings2 } from 'lucide-react'
import type { AppCopy } from '../lib/appCopy'
import type { DeviceControlActions, DeviceControlOptions } from '../lib/deviceControlTypes'

export type DeviceHomeOptionsSectionProps = {
  actions: Pick<
    DeviceControlActions,
    'onConfirmSensitiveActionsChange' | 'onPreferAdbKeyboardChange' | 'onUnrestrictedModeChange'
  >
  copy: AppCopy
  options: Pick<DeviceControlOptions, 'confirmSensitiveActions' | 'preferAdbKeyboard' | 'unrestrictedMode'>
}

export function DeviceHomeOptionsSection({
  actions,
  copy,
  options,
}: DeviceHomeOptionsSectionProps) {
  return (
    <section className="config-panel-group" aria-label={copy.deviceOptions}>
      <div className="panel-title">
        <Settings2 size={18} />
        <h2>{copy.deviceOptions}</h2>
      </div>
      <div className="home-device-options-panel">
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.preferAdbKeyboard}
            onChange={(event) => actions.onPreferAdbKeyboardChange(event.target.checked)}
          />
          <span>{copy.useAdbKeyboard}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.confirmSensitiveActions}
            disabled={options.unrestrictedMode}
            onChange={(event) => actions.onConfirmSensitiveActionsChange(event.target.checked)}
          />
          <span>{copy.confirmSensitiveActions}</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.unrestrictedMode}
            onChange={(event) => actions.onUnrestrictedModeChange(event.target.checked)}
          />
          <span>{copy.unrestrictedMode}</span>
        </label>
      </div>
    </section>
  )
}
