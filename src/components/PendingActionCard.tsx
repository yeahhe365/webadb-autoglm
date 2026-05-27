import { Check } from 'lucide-react'
import { buildActionPreview } from '../lib/actionPreview'
import type { AgentAction } from '../lib/actionTypes'
import type { AppCopy } from '../lib/appCopy'
import type { AgentStep } from '../lib/agent'
import type { BusyTask } from '../lib/busyTask'
import { getActionDisplay } from './actionDisplay'

type PendingActionCardProps = {
  busyTask: BusyTask | null
  copy: AppCopy
  onExecutePendingStep: () => void
  pendingStep: AgentStep
}

export function PendingActionCard({
  busyTask,
  copy,
  onExecutePendingStep,
  pendingStep,
}: PendingActionCardProps) {
  const actionDisplay = getActionDisplay(pendingStep.action, copy)
  const ActionIcon = actionDisplay.icon
  const actionLabel = pendingActionLabel(pendingStep.action.action, copy)
  const actionPreview = formatPendingActionPreview(pendingStep)

  return (
    <article
      className="pending-action"
      aria-label={`${copy.pendingAction}: ${actionDisplay.label}`}
    >
      <div className="pending-action-body">
        <span className="agent-step-action-icon pending-action-icon" aria-hidden="true">
          <ActionIcon size={16} strokeWidth={2} />
        </span>
        <div className="pending-action-content">
          <div className="pending-header">
            <span>{copy.pendingAction}</span>
            <div className="pending-step-meta">
              <small>{copy.step} {pendingStep.index}</small>
            </div>
          </div>
          <strong className="pending-action-name">{actionDisplay.label}</strong>
          <div className="pending-action-meta" aria-label={copy.stepDetails}>
            <span className="pending-action-chip" title={copy.stepTiming(pendingStep.timing.totalMs)}>
              {pendingStep.timing.totalMs} ms
            </span>
            <span
              className="pending-action-chip"
              title={
                pendingStep.toolName ? `${copy.stepTool}: ${pendingStep.toolName}` : actionDisplay.label
              }
            >
              {pendingStep.toolName ?? pendingStep.action.action}
            </span>
          </div>
          <p className="pending-action-preview">{actionPreview}</p>
        </div>
      </div>
      <button
        type="button"
        className="wide primary pending-action-button"
        onClick={onExecutePendingStep}
        disabled={Boolean(busyTask)}
        title={busyTask ? copy.waitForCurrentRun : actionLabel}
      >
        <Check size={16} />
        {actionLabel}
      </button>
    </article>
  )
}

function pendingActionLabel(action: AgentAction['action'] | undefined, copy: AppCopy) {
  if (
    action === 'take_over' ||
    action === 'note' ||
    action === 'interact' ||
    action === 'call_api'
  ) {
    return copy.acknowledge
  }
  if (action === 'done') {
    return copy.finish
  }
  return copy.execute
}

function formatPendingActionPreview(step: AgentStep) {
  return (
    extractActionNarrative(step.action) ??
    stripPreviewPrefix(step.preview.trim()) ??
    buildActionPreview(step.action)
  )
}

function extractActionNarrative(action: AgentAction): string | null {
  if ('reason' in action && action.reason?.trim()) {
    return action.reason.trim()
  }

  switch (action.action) {
    case 'tap':
      return action.message?.trim() || null
    case 'input_text':
      return action.text.trim() || null
    case 'set_clipboard':
      return action.text.trim() || null
    case 'open_url':
      return action.url.trim() || null
    case 'take_over':
    case 'note':
    case 'interact':
      return action.message.trim() || null
    case 'call_api':
      return action.instruction.trim() || null
    case 'done':
      return action.summary?.trim() || null
    case 'sequence': {
      const childNarratives = action.actions.map(extractActionNarrative).filter(Boolean)
      return childNarratives.length > 0 ? childNarratives.join('\n') : null
    }
    case 'repeat':
      return extractActionNarrative(action.actionToRepeat)
    default:
      return null
  }
}

function stripPreviewPrefix(preview: string) {
  const separatorIndex = preview.lastIndexOf(' - ')
  if (separatorIndex < 0) {
    return null
  }
  return preview.slice(separatorIndex + 3).trim() || null
}
