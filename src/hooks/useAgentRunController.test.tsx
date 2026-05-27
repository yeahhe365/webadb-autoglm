// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { DeviceBackend } from '../adapters/deviceTypes'
import { createAgentSession } from '../lib/agent'
import { createDefaultAppCards } from '../lib/appCards'
import { APP_COPY } from '../lib/appCopy'
import type { OpenAiClient } from '../lib/openAiTypes'
import { createDefaultActionToolRegistry } from '../lib/toolRegistry'
import { useAgentRunController } from './useAgentRunController'

afterEach(() => {
  cleanup()
})

function createDevice(): DeviceBackend {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    execute: vi.fn(async () => 'executed'),
    getCurrentApp: vi.fn(async () => 'Chrome'),
    getDeviceState: vi.fn(async () => ({
      app: 'Chrome',
      packageName: 'com.android.chrome',
    })),
    getInstalledApps: vi.fn(async () => []),
    screenshot: vi.fn(async () => ({
      bytes: new Uint8Array(),
      dataUrl: 'data:image/png;base64,abc',
      screen: { width: 1080, height: 2400 },
    })),
    startScreenBlackout: vi.fn(async () => 'screen dimmed'),
    stopScreenBlackout: vi.fn(async () => 'screen restored'),
  }
}

describe('useAgentRunController', () => {
  it('dims and restores the Android screen around automatic control when enabled', async () => {
    const backend = createDevice()
    const session = createAgentSession('')
    const client: OpenAiClient = {
      completeAction: vi.fn(async () => '{"action":"done","summary":"done"}'),
      completeFinalResponse: vi.fn(async () => 'All done.'),
    }

    const { result } = renderHook(() =>
      useAgentRunController({
        actionProtocol: 'webdroid_json',
        actionToolRegistry: createDefaultActionToolRegistry(),
        addLog: vi.fn(),
        appCards: createDefaultAppCards(),
        backend,
        busyTask: null,
        canRunAgent: true,
        chatInput: 'Finish the task.',
        client,
        copy: APP_COPY['en-US'],
        customTools: [],
        device: {
          applyDeviceSnapshot: vi.fn(),
          confirmSensitiveAction: vi.fn(() => true),
          refreshDisplayedSnapshot: vi.fn(async () => ({
            deviceState: { app: 'Chrome' },
            screenshot: {
              bytes: new Uint8Array(),
              dataUrl: 'data:image/png;base64,abc',
              screen: { width: 1080, height: 2400 },
            },
          })),
        },
        ensureSession: () => session,
        maxSteps: 3,
        memoryEnabled: false,
        memoryItems: [],
        modelConfig: { baseUrl: 'https://api.example.com/v1', apiKey: 'key', model: 'm' },
        onMemoryItem: vi.fn(),
        pendingStep: null,
        runTask: async (_id, _label, action) => {
          await action()
        },
        screenBlackoutDuringAutoControl: true,
        secrets: [],
        setChatInput: vi.fn(),
        setError: vi.fn(),
        setPendingStep: vi.fn(),
        streamResponses: false,
        syncConversation: vi.fn(),
        unrestrictedMode: false,
      }),
    )

    await act(async () => {
      await result.current.submitChatMessage()
    })

    const startScreenBlackout = vi.mocked(backend.startScreenBlackout!)
    const stopScreenBlackout = vi.mocked(backend.stopScreenBlackout!)
    const screenshot = vi.mocked(backend.screenshot)
    const completeFinalResponse = vi.mocked(client.completeFinalResponse!)

    expect(startScreenBlackout).toHaveBeenCalledTimes(1)
    expect(stopScreenBlackout).toHaveBeenCalledTimes(1)
    expect(startScreenBlackout.mock.invocationCallOrder[0]!).toBeLessThan(
      screenshot.mock.invocationCallOrder[0]!,
    )
    expect(stopScreenBlackout.mock.invocationCallOrder[0]!).toBeGreaterThan(
      completeFinalResponse.mock.invocationCallOrder[0]!,
    )
  })
})
