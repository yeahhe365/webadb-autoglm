import { BrainCircuit, MonitorOff } from 'lucide-react'
import type { AppCopy } from '../lib/appCopy'

export type HomePreferencesSectionProps = {
  memoryEnabled: boolean
  screenBlackoutDuringAutoControl: boolean
  copy: AppCopy
  onMemoryEnabledChange: (value: boolean) => void
  onScreenBlackoutDuringAutoControlChange: (value: boolean) => void
}

export function HomePreferencesSection({
  copy,
  memoryEnabled,
  screenBlackoutDuringAutoControl,
  onMemoryEnabledChange,
  onScreenBlackoutDuringAutoControlChange,
}: HomePreferencesSectionProps) {
  return (
    <section className="config-panel-group" aria-label={copy.settingsPreferences}>
      <div className="panel-title">
        <BrainCircuit size={18} />
        <h2>{copy.settingsPreferences}</h2>
      </div>
      <div className="home-device-options-panel">
        <label className="toggle" title={copy.memoryHelp}>
          <input
            type="checkbox"
            checked={memoryEnabled}
            onChange={(event) => onMemoryEnabledChange(event.target.checked)}
          />
          <span>
            <BrainCircuit size={16} />
            {copy.memory}
          </span>
        </label>
        <label className="toggle" title={copy.screenBlackoutDuringAutoControlHelp}>
          <input
            type="checkbox"
            checked={screenBlackoutDuringAutoControl}
            onChange={(event) => onScreenBlackoutDuringAutoControlChange(event.target.checked)}
          />
          <span>
            <MonitorOff size={16} />
            {copy.screenBlackoutDuringAutoControl}
          </span>
        </label>
      </div>
    </section>
  )
}
