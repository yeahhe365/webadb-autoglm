import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AppSettings,
  type SettingsStorage,
} from './settings'

function memoryStorage(initial: Record<string, string> = {}): SettingsStorage {
  const values = { ...initial }
  return {
    getItem: vi.fn((key: string) => values[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values[key] = value
    }),
  }
}

describe('settings persistence', () => {
  it('uses gpt-5.5 as the default model', () => {
    expect(DEFAULT_SETTINGS.modelConfig.model).toBe('gpt-5.5')
  })

  it('loads defaults when no persisted settings exist', () => {
    expect(loadSettings(memoryStorage())).toEqual(DEFAULT_SETTINGS)
  })

  it('loads all persisted setting fields', () => {
    const persisted: AppSettings = {
      actionProtocol: 'mobilerun_xml',
      modelConfig: {
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        model: 'custom-model',
        reasoningEffort: 'high',
      },
      maxSteps: 12,
      memoryEnabled: true,
      preferAdbKeyboard: true,
      confirmSensitiveActions: false,
      unrestrictedMode: true,
      screenBlackoutDuringAutoControl: true,
      streamResponses: true,
      disabledActionTools: ['tap', 'open_url'],
      actionSettleMs: 350,
      doubleTapIntervalMs: 75,
      keyboardStepMs: 450,
      themeMode: 'dark',
      languageMode: 'zh-CN',
    }

    expect(
      loadSettings(
        memoryStorage({
          'webdroid-agent-settings': JSON.stringify(persisted),
        }),
      ),
    ).toEqual(persisted)
  })

  it('keeps old individual keys as migration fallback', () => {
    expect(
      loadSettings(
        memoryStorage({
          'webadb-demo-base-url': 'https://old.example.com/v1',
          'webadb-demo-model': 'old-model',
        }),
      ).modelConfig,
    ).toEqual({
      baseUrl: 'https://old.example.com/v1',
      apiKey: '',
      model: 'old-model',
    })
  })

  it('saves all settings under one key', () => {
    const storage = memoryStorage()
    const settings: AppSettings = {
      ...DEFAULT_SETTINGS,
      modelConfig: {
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        model: 'gpt-5.5',
        reasoningEffort: 'medium',
      },
    }

    saveSettings(settings, storage)

    expect(storage.setItem).toHaveBeenCalledWith('webdroid-agent-settings', JSON.stringify(settings))
  })

  it('normalizes new optimization settings when they are missing or invalid', () => {
    expect(
      loadSettings(
        memoryStorage({
          'webdroid-agent-settings': JSON.stringify({
            ...DEFAULT_SETTINGS,
            modelConfig: {
              ...DEFAULT_SETTINGS.modelConfig,
              reasoningEffort: 'deep',
            },
            actionProtocol: 'invalid-protocol',
            promptMode: 'invalid-mode',
            memoryEnabled: 'yes',
            screenBlackoutDuringAutoControl: 'yes',
            streamResponses: 'yes',
            disabledActionTools: ['tap', 'not-a-real-tool', 'tap'],
            actionSettleMs: -1,
            doubleTapIntervalMs: 10000,
            keyboardStepMs: Number.NaN,
            themeMode: 'blue',
            languageMode: 'klingon',
          }),
        }),
      ),
    ).toEqual({
      ...DEFAULT_SETTINGS,
      disabledActionTools: ['tap'],
    })
  })

  it('drops the removed AutoGLM native prompt mode from persisted settings', () => {
    const loaded = loadSettings(
      memoryStorage({
        'webdroid-agent-settings': JSON.stringify({
          ...DEFAULT_SETTINGS,
          promptMode: 'autoglm-native',
        }),
      }),
    )

    expect(loaded).not.toHaveProperty('promptMode')
  })

  it('keeps large max step values but still enforces the minimum', () => {
    expect(
      loadSettings(
        memoryStorage({
          'webdroid-agent-settings': JSON.stringify({
            ...DEFAULT_SETTINGS,
            maxSteps: 500,
          }),
        }),
      ).maxSteps,
    ).toBe(500)

    expect(
      loadSettings(
        memoryStorage({
          'webdroid-agent-settings': JSON.stringify({
            ...DEFAULT_SETTINGS,
            maxSteps: 0,
          }),
        }),
      ).maxSteps,
    ).toBe(1)
  })

  it('keeps the previous WebADB AutoGLM settings key as a migration fallback', () => {
    const persisted: AppSettings = {
      ...DEFAULT_SETTINGS,
      maxSteps: 12,
    }

    expect(
      loadSettings(
        memoryStorage({
          'webadb-autoglm-settings': JSON.stringify(persisted),
        }),
      ),
    ).toEqual(persisted)
  })

  it('keeps old combined settings key as a migration fallback', () => {
    const persisted: AppSettings = {
      ...DEFAULT_SETTINGS,
      maxSteps: 24,
    }

    expect(
      loadSettings(
        memoryStorage({
          'webadb-demo-settings': JSON.stringify(persisted),
        }),
      ),
    ).toEqual(persisted)
  })
})
