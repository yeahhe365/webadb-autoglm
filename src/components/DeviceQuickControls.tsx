import { ArrowLeft, CornerDownLeft, Home, Keyboard } from 'lucide-react'
import { useState } from 'react'
import type { AgentAction } from '../lib/actionTypes'
import type { AppCopy } from '../lib/appCopy'
import type { BusyTask } from '../lib/busyTask'

export type DeviceQuickControlsProps = {
  busyTask: BusyTask | null
  className?: string
  connected: boolean
  copy: AppCopy
  onRunDirectAction: (action: AgentAction) => void
}

export function DeviceQuickControls({
  busyTask,
  className,
  connected,
  copy,
  onRunDirectAction,
}: DeviceQuickControlsProps) {
  const [directText, setDirectText] = useState('')
  const directDisabled = Boolean(busyTask) || !connected

  return (
    <section
      aria-label={copy.directCommand}
      className={['device-quick-controls', className].filter(Boolean).join(' ')}
    >
      <div className="direct-text-row">
        <label>
          {copy.directText}
          <input
            type="text"
            value={directText}
            onChange={(event) => setDirectText(event.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => onRunDirectAction({ action: 'input_text', text: directText })}
          disabled={directDisabled || !directText.trim()}
        >
          <Keyboard size={16} />
          {copy.runType}
        </button>
      </div>
      <div className="button-row direct-key-row">
        <button
          type="button"
          onClick={() => onRunDirectAction({ action: 'back' })}
          disabled={directDisabled}
        >
          <ArrowLeft size={16} />
          {copy.runBack}
        </button>
        <button
          type="button"
          onClick={() => onRunDirectAction({ action: 'home' })}
          disabled={directDisabled}
        >
          <Home size={16} />
          {copy.runHome}
        </button>
        <button
          type="button"
          onClick={() => onRunDirectAction({ action: 'key', key: 'ENTER' })}
          disabled={directDisabled}
        >
          <CornerDownLeft size={16} />
          {copy.runEnter}
        </button>
      </div>
    </section>
  )
}
