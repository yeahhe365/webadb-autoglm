import type { DeviceState, InstalledApp } from '../adapters/deviceTypes'
import {
  getInstalledAppDisplayName,
  selectInstalledAppsForPrompt,
} from '../adapters/installedApps'
import type { AgentHistoryItem } from './openAiTypes'
import type { ScreenSize } from './actionTypes'
import { UNKNOWN_APP_NAME } from './deviceState'
import { buildScreenshotContext } from './screenshot'

export const DEFAULT_INSTALLED_APPS_PROMPT_LIMIT = 40

export const CANONICAL_COORDINATE_INSTRUCTION = [
  'Coordinates use pixels in the attached screenshot.',
  'Use numeric x/y labels on major grid lines as anchors; do not answer with grid-cell numbers.',
  'Your screenshot coordinates are mapped back to native device pixels before execution.',
].join(' ')

export type PromptScreenInfoInput = {
  currentApp?: string
  deviceScreen?: ScreenSize
  deviceState?: DeviceState
  screen: ScreenSize
}

export function buildPromptScreenInfo({
  currentApp,
  deviceScreen,
  deviceState,
  screen,
}: PromptScreenInfoInput) {
  const state = deviceState ?? { app: currentApp ?? UNKNOWN_APP_NAME }

  return JSON.stringify({
    current_app: currentApp ?? state.app ?? UNKNOWN_APP_NAME,
    ...(state.packageName ? { package_name: state.packageName } : {}),
    ...(state.activity ? { activity: state.activity } : {}),
    ...(state.orientation ? { orientation: state.orientation } : {}),
    ...(state.keyboard ? { keyboard: state.keyboard } : {}),
    ...buildScreenshotContext({ modelScreen: screen, deviceScreen }),
  })
}

export function formatPromptHistoryItem(item: AgentHistoryItem) {
  const details = [
    item.currentApp ? `app=${item.currentApp}` : null,
    `action=${item.actionPreview}`,
    item.executionResult ? `result=${item.executionResult}` : null,
  ]
    .filter(Boolean)
    .join(' | ')
  return `Step ${item.step}: ${details}`
}

export function formatInstalledAppsForPrompt(
  installedApps?: readonly InstalledApp[],
  query = '',
  limit = DEFAULT_INSTALLED_APPS_PROMPT_LIMIT,
) {
  const apps = selectInstalledAppsForPrompt(installedApps, query, limit)
  if (apps.length === 0) {
    return null
  }

  const lines = apps.map((app) => `${getInstalledAppDisplayName(app)}: ${app.packageName}`)

  const hiddenCount = Math.max(0, (installedApps?.length ?? 0) - apps.length)
  return [
    `<installed_apps>`,
    ...lines,
    hiddenCount > 0 ? `... truncated ${hiddenCount} more apps` : null,
    `</installed_apps>`,
  ]
    .filter(Boolean)
    .join('\n')
}
