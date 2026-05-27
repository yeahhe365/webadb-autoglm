import type { ReactNode } from 'react'
import type { AppCopy } from '../lib/appCopy'

export type DeviceOptionsSectionProps = {
  actionSettleMs: number
  className?: string
  copy: AppCopy
  doubleTapIntervalMs: number
  keyboardStepMs: number
  onActionSettleMsChange: (value: number) => void
  onDoubleTapIntervalMsChange: (value: number) => void
  onKeyboardStepMsChange: (value: number) => void
  sectionId?: string
  summary?: ReactNode
}

export function DeviceOptionsSection({
  actionSettleMs,
  className = 'compact-section',
  copy,
  doubleTapIntervalMs,
  keyboardStepMs,
  onActionSettleMsChange,
  onDoubleTapIntervalMsChange,
  onKeyboardStepMsChange,
  sectionId,
  summary,
}: DeviceOptionsSectionProps) {
  return (
    <details className={className} id={sectionId}>
      <summary>{summary ?? copy.deviceOptions}</summary>
      <div className="device-options-panel">
        <div className="timing-grid">
          <label>
            {copy.actionSettle}
            <input
              type="number"
              min={100}
              max={5000}
              step={50}
              value={actionSettleMs}
              onChange={(event) => onActionSettleMsChange(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.doubleTapInterval}
            <input
              type="number"
              min={20}
              max={1000}
              step={5}
              value={doubleTapIntervalMs}
              onChange={(event) => onDoubleTapIntervalMsChange(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.keyboardStep}
            <input
              type="number"
              min={100}
              max={5000}
              step={50}
              value={keyboardStepMs}
              onChange={(event) => onKeyboardStepMsChange(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="capability-grid" aria-label={copy.supportedActions}>
          {copy.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>
    </details>
  )
}
