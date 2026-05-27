import { AppWindow, BookOpen, Settings as SettingsIcon, Usb } from 'lucide-react'
import type { AppCopy } from '../lib/appCopy'
import { isWebUsbSupported } from '../adapters/webUsbSupport'
import { formatCurrentAppLabel } from './deviceDisplay'

type AppTopbarProps = {
  copy: AppCopy
  currentApp: string
  isTutorialOpen: boolean
  onOpenSettings: () => void
  onToggleTutorial: () => void
}

export function AppTopbar({
  copy,
  currentApp,
  isTutorialOpen,
  onOpenSettings,
  onToggleTutorial,
}: AppTopbarProps) {
  const webUsbSupported = isWebUsbSupported()
  const tutorialButtonLabel = isTutorialOpen ? copy.closeTutorial : copy.openTutorial
  const tutorialButtonClassName = isTutorialOpen
    ? 'topbar-button tutorial-button active'
    : 'topbar-button tutorial-button'
  const currentAppLabel = formatCurrentAppLabel(currentApp, copy)

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img
          alt="WebDroid Agent logo"
          className="app-logo"
          src="/webdroid-agent-logo-128.png"
        />
        <h1>WebDroid Agent</h1>
      </div>
      <div className="topbar-actions">
        <div className="status-strip">
          <span className={webUsbSupported ? 'status ok' : 'status warn'}>
            <Usb size={16} />
            <span className="status-label">
              <span className="status-prefix">WebUSB </span>
              {webUsbSupported ? copy.webUsbReady : copy.webUsbMissing}
            </span>
          </span>
          <span className="status current-app-status" title={`${copy.currentApp}: ${currentAppLabel}`}>
            <AppWindow size={16} />
            <span className="status-label">
              <span className="status-prefix">{copy.currentApp}: </span>
              {currentAppLabel}
            </span>
          </span>
        </div>
        <button
          type="button"
          className={tutorialButtonClassName}
          aria-controls="tutorial-panel"
          aria-expanded={isTutorialOpen}
          aria-label={tutorialButtonLabel}
          onClick={onToggleTutorial}
        >
          <BookOpen size={16} />
          <span className="topbar-button-label">{copy.tutorial}</span>
        </button>
        <button
          type="button"
          className="topbar-button settings-button"
          aria-label={copy.settings}
          onClick={onOpenSettings}
        >
          <SettingsIcon size={16} />
          <span className="topbar-button-label">{copy.settings}</span>
        </button>
      </div>
    </header>
  )
}
