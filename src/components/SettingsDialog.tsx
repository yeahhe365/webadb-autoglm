import {
  Archive,
  BadgeInfo,
  Boxes,
  CircleAlert,
  Code2,
  ExternalLink,
  FileKey2,
  GitFork,
  HardDrive,
  Languages,
  LayoutPanelLeft,
  ListChecks,
  MessageSquareX,
  PanelTop,
  RotateCcw,
  Search,
  ScrollText,
  SquareTerminal,
  Star,
  SunMoon,
  Tag,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { AppCopy } from '../lib/appCopy'
import { REPOSITORY_URL, type RepositoryStats } from '../lib/repository'
import {
  MIN_AGENT_STEPS,
  type LanguageMode,
  type ThemeMode,
} from '../lib/settings'
import { DEFAULT_ACTION_TOOL_NAMES, type ActionToolName } from '../lib/toolRegistry'
import type { StorageEstimateStatus, StorageUsageEstimate } from '../hooks/useStorageEstimate'

export type SettingsDialogProps = {
  appCardsJson: string
  appCardsJsonError: string | null
  copy: AppCopy
  customToolsJson: string
  customToolsJsonError: string | null
  disabledActionTools: readonly ActionToolName[]
  languageMode: LanguageMode
  maxSteps: number
  onAppCardsJsonChange: (value: string) => void
  onCustomToolsJsonChange: (value: string) => void
  onDisabledActionToolsChange: (value: ActionToolName[]) => void
  onLanguageModeChange: (value: LanguageMode) => void
  onClearChatHistory: () => void
  onClearRunLog: () => void
  onClose: () => void
  onMaxStepsChange: (value: number) => void
  onResetAppCards: () => void
  onSecretRecordsJsonChange: (value: string) => void
  onThemeModeChange: (value: ThemeMode) => void
  repositoryStats: RepositoryStats | null
  repositoryStatsStatus: 'idle' | 'loading' | 'done' | 'error'
  storageEstimate: StorageUsageEstimate | null
  storageEstimateStatus: StorageEstimateStatus
  secretRecordsJson: string
  secretRecordsJsonError: string | null
  themeMode: ThemeMode
}

type SettingsTabId = 'preferences' | 'resources' | 'data' | 'project'

type SettingsTab = {
  compactLabel: string
  icon: LucideIcon
  id: SettingsTabId
  label: string
}

type SettingsTabGroup = {
  id: string
  tabs: SettingsTab[]
}

export function SettingsDialog({
  appCardsJson,
  appCardsJsonError,
  copy,
  customToolsJson,
  customToolsJsonError,
  disabledActionTools,
  languageMode,
  maxSteps,
  onAppCardsJsonChange,
  onCustomToolsJsonChange,
  onDisabledActionToolsChange,
  onLanguageModeChange,
  onClearChatHistory,
  onClearRunLog,
  onClose,
  onMaxStepsChange,
  onResetAppCards,
  onSecretRecordsJsonChange,
  onThemeModeChange,
  repositoryStats,
  repositoryStatsStatus,
  storageEstimate,
  storageEstimateStatus,
  secretRecordsJson,
  secretRecordsJsonError,
  themeMode,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('preferences')
  const settingsTabs: SettingsTab[] = [
    {
      id: 'preferences',
      compactLabel: copy.settingsPreferencesShort,
      icon: LayoutPanelLeft,
      label: copy.settingsPreferences,
    },
    {
      id: 'resources',
      compactLabel: copy.settingsResourcesShort,
      icon: Boxes,
      label: copy.settingsResources,
    },
    {
      id: 'data',
      compactLabel: copy.dataManagementShort,
      icon: Archive,
      label: copy.dataManagement,
    },
    {
      id: 'project',
      compactLabel: copy.settingsProjectInfoShort,
      icon: BadgeInfo,
      label: copy.settingsProjectInfo,
    },
  ]
  const settingsTabGroups: SettingsTabGroup[] = [
    { id: 'primary', tabs: settingsTabs.filter((tab) => tab.id !== 'project') },
    { id: 'project', tabs: settingsTabs.filter((tab) => tab.id === 'project') },
  ]
  const activeTabLabel =
    settingsTabs.find((tab) => tab.id === activeTab)?.label ?? copy.settings

  return (
    <div
      className="settings-page"
      role="dialog"
      aria-modal="true"
      aria-label={copy.settings}
      onClick={onClose}
    >
      <section className="settings-panel" onClick={(event) => event.stopPropagation()}>
        <aside className="settings-sidebar">
          <div className="settings-sidebar-header">
            <button
              type="button"
              className="settings-close-button"
              onClick={onClose}
              aria-label={copy.closeSettings}
              title={copy.closeSettings}
            >
              <X size={20} />
            </button>
            <span className="settings-sidebar-title">{copy.settings}</span>
            <span className="settings-sidebar-spacer" aria-hidden="true" />
          </div>

          <nav className="settings-nav" aria-label={copy.settings} role="tablist">
            {settingsTabGroups.map((group) => (
              <div className="settings-nav-group" data-settings-group={group.id} key={group.id}>
                {group.tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={isActive ? 'settings-tab-button is-active' : 'settings-tab-button'}
                      id={`settings-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-label={tab.label}
                      aria-controls={`settings-tabpanel-${tab.id}`}
                      aria-selected={isActive}
                      title={tab.label}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
                      <span className="settings-tab-full-label" aria-hidden="true">
                        {tab.label}
                      </span>
                      <span className="settings-tab-compact-label" aria-hidden="true">
                        {tab.compactLabel}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="settings-main">
          <div className="settings-content">
            <div className="settings-main-heading">
              <h2>{activeTabLabel}</h2>
            </div>

            <div
              className="settings-tab-content"
              id={`settings-tabpanel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`settings-tab-${activeTab}`}
            >
              {activeTab === 'preferences' ? (
                <section
                  className="settings-section settings-preferences"
                  aria-label={copy.settingsPreferences}
                >
                  <div className="settings-preferences-grid">
                    <label className="settings-field">
                      <span>
                        <Languages size={16} />
                        {copy.language}
                      </span>
                      <select
                        value={languageMode}
                        onChange={(event) =>
                          onLanguageModeChange(event.target.value as LanguageMode)
                        }
                      >
                        <option value="system">{copy.languageSystem}</option>
                        <option value="zh-CN">{copy.languageChinese}</option>
                        <option value="en-US">{copy.languageEnglish}</option>
                      </select>
                    </label>
                    <label className="settings-field">
                      <span>
                        <SunMoon size={16} />
                        {copy.theme}
                      </span>
                      <select
                        value={themeMode}
                        onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}
                      >
                        <option value="system">{copy.themeSystem}</option>
                        <option value="light">{copy.themeLight}</option>
                        <option value="dark">{copy.themeDark}</option>
                      </select>
                    </label>
                    <label className="settings-field">
                      <span>
                        <ListChecks size={16} />
                        {copy.maxSteps}
                      </span>
                      <input
                        type="number"
                        min={MIN_AGENT_STEPS}
                        value={maxSteps}
                        onChange={(event) => onMaxStepsChange(event.target.valueAsNumber)}
                      />
                    </label>
                  </div>
                </section>
              ) : null}

              {activeTab === 'data' ? (
                <div className="settings-panel-stack">
                  <section className="settings-storage" aria-label={copy.localCache}>
                    <div>
                      <span>
                        <HardDrive size={16} />
                        {copy.localCache}
                      </span>
                      <strong>
                        {formatStorageStatus(storageEstimate, storageEstimateStatus, copy)}
                      </strong>
                    </div>
                    {storageEstimateStatus === 'done' && storageEstimate?.quotaBytes ? (
                      <meter
                        aria-label={copy.localCacheUsage}
                        min={0}
                        max={storageEstimate.quotaBytes}
                        value={storageEstimate.usageBytes}
                      />
                    ) : null}
                  </section>
                  <section className="settings-data-management" aria-label={copy.dataManagement}>
                    <div className="settings-data-management-title">
                      <Archive size={16} />
                      <span>{copy.dataManagement}</span>
                    </div>
                    <div className="settings-data-actions">
                      <button type="button" className="danger" onClick={onClearChatHistory}>
                        <MessageSquareX size={16} />
                        {copy.clearChatHistory}
                      </button>
                      <button type="button" onClick={onClearRunLog}>
                        <ScrollText size={16} />
                        {copy.clearRunLog}
                      </button>
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === 'resources' ? (
                <section
                  className="settings-section settings-resources"
                  aria-label={copy.settingsResources}
                >
                  <div className="settings-resource-grid">
                    <ActionToolAvailabilitySection
                      copy={copy}
                      disabledActionTools={disabledActionTools}
                      onChange={onDisabledActionToolsChange}
                    />
                    <ResourceEditor
                      icon={PanelTop}
                      label={copy.appCards}
                      textareaLabel={copy.appCardsJson}
                      value={appCardsJson}
                      onChange={onAppCardsJsonChange}
                      error={appCardsJsonError}
                      action={
                        <button type="button" onClick={onResetAppCards}>
                          <RotateCcw size={15} />
                          {copy.resetAppCards}
                        </button>
                      }
                    />
                    <ResourceEditor
                      icon={FileKey2}
                      label={copy.secrets}
                      textareaLabel={copy.secretsJson}
                      value={secretRecordsJson}
                      onChange={onSecretRecordsJsonChange}
                      error={secretRecordsJsonError}
                    />
                    <ResourceEditor
                      icon={SquareTerminal}
                      label={copy.customTools}
                      textareaLabel={copy.customToolsJson}
                      value={customToolsJson}
                      onChange={onCustomToolsJsonChange}
                      error={customToolsJsonError}
                    />
                  </div>
                </section>
              ) : null}

              {activeTab === 'project' ? (
                <section
                  className="settings-section settings-project"
                  aria-label={copy.settingsProjectInfo}
                >
                  <p className="settings-copy">{copy.appDescription}</p>
                  <div className="settings-project-grid">
                    <div className="settings-project-links">
                      <div className="app-version" aria-label={copy.appVersion}>
                        <Tag size={18} />
                        <strong>{__APP_VERSION__}</strong>
                        <span>{copy.appVersion}</span>
                      </div>
                      <a
                        className="repository-link"
                        href={REPOSITORY_URL}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={copy.githubRepository}
                      >
                        <Code2 size={18} />
                        <span>{REPOSITORY_URL}</span>
                        <ExternalLink size={15} />
                      </a>
                    </div>
                    <div className="repository-stats" aria-label={copy.repositoryStats}>
                      <RepositoryStat
                        icon={Star}
                        label={copy.stars}
                        status={repositoryStatsStatus}
                        value={repositoryStats?.stars}
                      />
                      <RepositoryStat
                        icon={GitFork}
                        label={copy.forks}
                        status={repositoryStatsStatus}
                        value={repositoryStats?.forks}
                      />
                      <RepositoryStat
                        icon={CircleAlert}
                        label={copy.openIssues}
                        status={repositoryStatsStatus}
                        value={repositoryStats?.openIssues}
                      />
                    </div>
                  </div>
                  {repositoryStatsStatus === 'error' ? (
                    <p className="settings-error">{copy.githubStatsError}</p>
                  ) : null}
                </section>
              ) : null}
            </div>
          </div>
        </main>
      </section>
    </div>
  )
}

type ActionToolAvailabilitySectionProps = {
  copy: AppCopy
  disabledActionTools: readonly ActionToolName[]
  onChange: (value: ActionToolName[]) => void
}

type ActionToolFilter = 'all' | 'disabled' | 'enabled'

function ActionToolAvailabilitySection({
  copy,
  disabledActionTools,
  onChange,
}: ActionToolAvailabilitySectionProps) {
  const [toolSearch, setToolSearch] = useState('')
  const [toolFilter, setToolFilter] = useState<ActionToolFilter>('all')
  const disabledTools = new Set(disabledActionTools)
  const normalizedToolSearch = toolSearch.trim().toLocaleLowerCase()
  const visibleTools = DEFAULT_ACTION_TOOL_NAMES.filter((toolName) => {
    const enabled = !disabledTools.has(toolName)
    if (toolFilter === 'enabled' && !enabled) {
      return false
    }
    if (toolFilter === 'disabled' && enabled) {
      return false
    }
    if (!normalizedToolSearch) {
      return true
    }

    const label = copy.actionNames[toolName] ?? toolName
    return [label, toolName].some((value) =>
      value.toLocaleLowerCase().includes(normalizedToolSearch),
    )
  })
  const enabledCount = DEFAULT_ACTION_TOOL_NAMES.length - disabledTools.size
  const emptyMessage = normalizedToolSearch
    ? copy.noActionToolSearchResults(toolSearch.trim())
    : copy.noActionToolsInFilter(toolFilter)

  function toggleTool(toolName: ActionToolName, enabled: boolean) {
    const nextDisabledTools = new Set(disabledActionTools)
    if (enabled) {
      nextDisabledTools.delete(toolName)
    } else {
      nextDisabledTools.add(toolName)
    }
    onChange(
      DEFAULT_ACTION_TOOL_NAMES.filter((candidate) => nextDisabledTools.has(candidate)),
    )
  }

  return (
    <section
      className="settings-resource-management settings-tool-availability"
      aria-label={copy.actionTools}
    >
      <div className="settings-resource-title">
        <Wrench size={16} />
        <span>{copy.actionTools}</span>
        <small className="settings-tool-summary">
          {copy.actionToolsSummary(enabledCount, DEFAULT_ACTION_TOOL_NAMES.length)}
        </small>
      </div>
      <label className="settings-tool-search">
        <Search size={15} />
        <span className="visually-hidden">{copy.actionToolSearch}</span>
        <input
          type="search"
          value={toolSearch}
          onChange={(event) => setToolSearch(event.target.value)}
          placeholder={copy.actionToolSearchPlaceholder}
          aria-label={copy.actionToolSearch}
        />
        {toolSearch ? (
          <button
            type="button"
            onClick={() => setToolSearch('')}
            aria-label={copy.actionToolSearchClear}
            title={copy.actionToolSearchClear}
          >
            <X size={14} />
          </button>
        ) : null}
      </label>
      <div
        className="settings-tool-filters"
        role="group"
        aria-label={copy.actionToolFilter}
      >
        {([
          ['all', copy.actionToolFilterAll],
          ['enabled', copy.actionToolFilterEnabled],
          ['disabled', copy.actionToolFilterDisabled],
        ] as const).map(([filter, label]) => (
          <button
            type="button"
            key={filter}
            className={toolFilter === filter ? 'is-active' : undefined}
            aria-pressed={toolFilter === filter}
            onClick={() => setToolFilter(filter)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="settings-tool-list">
        {visibleTools.length === 0 ? (
          <p className="settings-tool-empty">{emptyMessage}</p>
        ) : null}
        {visibleTools.map((toolName) => {
          const enabled = !disabledTools.has(toolName)
          const label = copy.actionNames[toolName] ?? toolName

          return (
            <div
              className={enabled ? 'settings-tool-row' : 'settings-tool-row is-disabled'}
              key={toolName}
            >
              <div>
                <strong>{label}</strong>
                <code>{toolName}</code>
              </div>
              <label className="toggle settings-tool-toggle">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => toggleTool(toolName, event.target.checked)}
                  aria-label={copy.actionToolToggle(label)}
                />
                <span>{enabled ? copy.actionToolEnabled : copy.actionToolDisabled}</span>
              </label>
            </div>
          )
        })}
      </div>
    </section>
  )
}

type ResourceEditorProps = {
  action?: ReactNode
  error: string | null
  icon: LucideIcon
  label: string
  onChange: (value: string) => void
  textareaLabel: string
  value: string
}

function ResourceEditor({
  action,
  error,
  icon: Icon,
  label,
  onChange,
  textareaLabel,
  value,
}: ResourceEditorProps) {
  return (
    <section className="settings-resource-management" aria-label={label}>
      <div className="settings-resource-title">
        <Icon size={16} />
        <span>{label}</span>
        {action}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        aria-label={textareaLabel}
      />
      {error ? <p className="settings-error">{error}</p> : null}
    </section>
  )
}

type RepositoryStatProps = {
  icon: LucideIcon
  label: string
  status: SettingsDialogProps['repositoryStatsStatus']
  value: number | undefined
}

function RepositoryStat({ icon: Icon, label, status, value }: RepositoryStatProps) {
  return (
    <div>
      <Icon size={18} />
      <strong>{status === 'loading' ? '...' : (value?.toLocaleString() ?? '-')}</strong>
      <span>{label}</span>
    </div>
  )
}

function formatStorageStatus(
  storageEstimate: StorageUsageEstimate | null,
  status: StorageEstimateStatus,
  copy: AppCopy,
) {
  if (status === 'loading' || status === 'idle') {
    return copy.localCacheLoading
  }
  if (status === 'unsupported') {
    return copy.localCacheUnavailable
  }
  if (status === 'error' || !storageEstimate) {
    return copy.localCacheError
  }

  const usage = formatBytes(storageEstimate.usageBytes)
  const quota = storageEstimate.quotaBytes ? formatBytes(storageEstimate.quotaBytes) : null
  return quota ? copy.localCacheUsageOf(usage, quota) : copy.localCacheUsageOnly(usage)
}

function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const
  let value = Math.max(0, bytes)
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const maximumFractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1
  const formattedValue = new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)

  return `${formattedValue} ${units[unitIndex]}`
}
