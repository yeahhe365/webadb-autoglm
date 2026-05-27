import {
  MousePointerClick,
  Move,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  DEFAULT_DIRECT_SWIPE_FROM_X,
  DEFAULT_DIRECT_SWIPE_FROM_Y,
  DEFAULT_DIRECT_SWIPE_TO_X,
  DEFAULT_DIRECT_SWIPE_TO_Y,
  DEFAULT_DIRECT_TAP_X,
  DEFAULT_DIRECT_TAP_Y,
  DEFAULT_SWIPE_DURATION_MS,
} from '../lib/actionDefaults'
import type { AgentAction } from '../lib/actionTypes'
import type { AppCopy } from '../lib/appCopy'
import type { BusyTask } from '../lib/busyTask'

export type DirectCommandsSectionProps = {
  busyTask: BusyTask | null
  className?: string
  connected: boolean
  copy: AppCopy
  onRunDirectAction: (action: AgentAction) => void
  sectionId?: string
  summary?: ReactNode
}

export function DirectCommandsSection({
  busyTask,
  className = 'compact-section',
  connected,
  copy,
  onRunDirectAction,
  sectionId,
  summary,
}: DirectCommandsSectionProps) {
  const [tapX, setTapX] = useState(DEFAULT_DIRECT_TAP_X)
  const [tapY, setTapY] = useState(DEFAULT_DIRECT_TAP_Y)
  const [swipeFromX, setSwipeFromX] = useState(DEFAULT_DIRECT_SWIPE_FROM_X)
  const [swipeFromY, setSwipeFromY] = useState(DEFAULT_DIRECT_SWIPE_FROM_Y)
  const [swipeToX, setSwipeToX] = useState(DEFAULT_DIRECT_SWIPE_TO_X)
  const [swipeToY, setSwipeToY] = useState(DEFAULT_DIRECT_SWIPE_TO_Y)

  const isBusy = Boolean(busyTask)
  const directDisabled = isBusy || !connected

  return (
    <details className={className} id={sectionId}>
      <summary>{summary ?? copy.directCommands}</summary>
      <section className="direct-command-panel" aria-label={copy.directCommands}>
        <div className="direct-command-grid two">
          <label>
            {copy.tapX}
            <input
              type="number"
              value={tapX}
              onChange={(event) => setTapX(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.tapY}
            <input
              type="number"
              value={tapY}
              onChange={(event) => setTapY(Number(event.target.value))}
            />
          </label>
        </div>
        <button
          type="button"
          className="wide"
          onClick={() => onRunDirectAction({ action: 'tap', x: tapX, y: tapY })}
          disabled={directDisabled}
        >
          <MousePointerClick size={16} />
          {copy.runTap}
        </button>
        <div className="direct-command-grid four">
          <label>
            {copy.swipeFromX}
            <input
              type="number"
              value={swipeFromX}
              onChange={(event) => setSwipeFromX(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.swipeFromY}
            <input
              type="number"
              value={swipeFromY}
              onChange={(event) => setSwipeFromY(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.swipeToX}
            <input
              type="number"
              value={swipeToX}
              onChange={(event) => setSwipeToX(Number(event.target.value))}
            />
          </label>
          <label>
            {copy.swipeToY}
            <input
              type="number"
              value={swipeToY}
              onChange={(event) => setSwipeToY(Number(event.target.value))}
            />
          </label>
        </div>
        <button
          type="button"
          className="wide"
          onClick={() =>
            onRunDirectAction({
              action: 'swipe',
              fromX: swipeFromX,
              fromY: swipeFromY,
              toX: swipeToX,
              toY: swipeToY,
              durationMs: DEFAULT_SWIPE_DURATION_MS,
            })
          }
          disabled={directDisabled}
        >
          <Move size={16} />
          {copy.runSwipe}
        </button>
      </section>
    </details>
  )
}
