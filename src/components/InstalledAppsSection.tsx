import { Play, Search, X } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import {
  getInstalledAppDisplayName,
  getInstalledAppSearchValues,
} from '../adapters/installedApps'
import type { InstalledApp } from '../adapters/deviceTypes'
import type { AppCopy } from '../lib/appCopy'
import type { BusyTask } from '../lib/busyTask'
import { LazyDetails } from './LazyDetails'

export type InstalledAppsSectionProps = {
  busyTask: BusyTask | null
  className?: string
  connected: boolean
  copy: AppCopy
  installedApps: InstalledApp[]
  onLaunchInstalledApp: (app: InstalledApp) => void
  sectionId?: string
  summary?: ReactNode
}

export function InstalledAppsSection({
  busyTask,
  className = 'compact-section',
  connected,
  copy,
  installedApps,
  onLaunchInstalledApp,
  sectionId,
  summary,
}: InstalledAppsSectionProps) {
  const searchInputId = useId()
  const [appSearch, setAppSearch] = useState('')

  const isBusy = Boolean(busyTask)
  const launchDisabled = isBusy || !connected
  const trimmedAppSearch = appSearch.trim()
  const normalizedAppSearch = trimmedAppSearch.toLowerCase()

  return (
    <LazyDetails
      className={className}
      id={sectionId}
      summary={summary ?? copy.installedApps}
    >
      {() => {
        const visibleApps = filterInstalledApps(installedApps, normalizedAppSearch)
        const emptyMessage =
          installedApps.length > 0 && trimmedAppSearch
            ? copy.noAppSearchResults(trimmedAppSearch)
            : copy.noInstalledApps

        return (
          <section className="installed-app-panel" aria-label={copy.installedApps}>
            <div className="search-field">
              <label htmlFor={searchInputId}>{copy.appSearch}</label>
              <span>
                <Search className="search-icon" size={15} />
                <input
                  id={searchInputId}
                  type="search"
                  value={appSearch}
                  onChange={(event) => setAppSearch(event.target.value)}
                />
                {appSearch ? (
                  <button
                    type="button"
                    className="search-clear-button"
                    onClick={() => setAppSearch('')}
                    aria-label={copy.clearAppSearch}
                    title={copy.clearAppSearch}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </span>
            </div>
            {visibleApps.length > 0 ? (
              <div className="installed-app-list">
                {visibleApps.map((app) => {
                  const appName = getInstalledAppDisplayName(app)
                  return (
                    <article className="installed-app-row" key={app.packageName}>
                      <div>
                        <strong>{appName}</strong>
                        <small>{app.packageName}</small>
                      </div>
                      <button
                        type="button"
                        aria-label={copy.launchInstalledApp(appName)}
                        onClick={() => onLaunchInstalledApp(app)}
                        disabled={launchDisabled}
                      >
                        <Play size={15} />
                        {copy.launchApp}
                      </button>
                    </article>
                  )
                })}
              </div>
            ) : (
              <p className="muted compact installed-app-empty">{emptyMessage}</p>
            )}
          </section>
        )
      }}
    </LazyDetails>
  )
}

function filterInstalledApps(installedApps: InstalledApp[], normalizedSearch: string) {
  if (!normalizedSearch) {
    return installedApps
  }

  return installedApps.filter((app) =>
    getInstalledAppSearchValues(app).some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    ),
  )
}
