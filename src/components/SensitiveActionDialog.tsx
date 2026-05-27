import { AlertTriangle, Check, X } from 'lucide-react'
import { useEffect } from 'react'
import type { AgentAction } from '../lib/actionTypes'
import { buildActionPreview } from '../lib/actionPreview'
import type { AppCopy } from '../lib/appCopy'

export type SensitiveActionDialogRequest = {
  action: AgentAction
  message: string
}

export type SensitiveActionDialogProps = {
  copy: AppCopy
  onCancel: () => void
  onConfirm: () => void
  request: SensitiveActionDialogRequest | null
}

export function SensitiveActionDialog({
  copy,
  onCancel,
  onConfirm,
  request,
}: SensitiveActionDialogProps) {
  useEffect(() => {
    if (!request) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, request])

  if (!request) {
    return null
  }

  const preview = buildActionPreview(request.action)

  return (
    <div
      className="sensitive-action-dialog-page"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensitive-action-title"
      onClick={onCancel}
    >
      <section
        className="sensitive-action-dialog-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sensitive-action-dialog-header">
          <span className="sensitive-action-dialog-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>
          <div>
            <p className="eyebrow">{copy.confirmSensitiveActions}</p>
            <h2 id="sensitive-action-title">{copy.sensitiveActionTitle}</h2>
          </div>
        </header>

        <p className="sensitive-action-dialog-message">{request.message}</p>

        <div className="sensitive-action-dialog-preview" aria-label={copy.stepParsedAction}>
          <span>{copy.stepParsedAction}</span>
          <code>{preview}</code>
        </div>

        <p className="sensitive-action-dialog-prompt">{copy.sensitiveActionPrompt}</p>

        <div className="sensitive-action-dialog-actions">
          <button type="button" onClick={onCancel}>
            <X size={16} />
            {copy.cancel}
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            <Check size={16} />
            {copy.execute}
          </button>
        </div>
      </section>
    </div>
  )
}
