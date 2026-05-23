// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { APP_COPY } from '../lib/appCopy'
import { DevicePanel } from './DevicePanel'

function renderDevicePanel(overrides: Partial<Parameters<typeof DevicePanel>[0]> = {}) {
  const props: Parameters<typeof DevicePanel>[0] = {
    actionSettleMs: 1000,
    busyTask: null,
    confirmSensitiveActions: false,
    connected: false,
    copy: APP_COPY['zh-CN'],
    currentApp: 'Unknown',
    deviceInfo: null,
    doctorResults: [],
    deviceState: { app: 'Unknown' },
    doubleTapIntervalMs: 100,
    installedApps: [],
    keyboardStepMs: 1000,
    preferAdbKeyboard: false,
    onActionSettleMsChange: vi.fn(),
    onCaptureScreen: vi.fn(),
    onConfirmSensitiveActionsChange: vi.fn(),
    onConnectDevice: vi.fn(),
    onDisconnectDevice: vi.fn(),
    onDoubleTapIntervalMsChange: vi.fn(),
    onEnableAdbKeyboard: vi.fn(),
    onInstallAdbKeyboard: vi.fn(),
    onKeyboardStepMsChange: vi.fn(),
    onLaunchInstalledApp: vi.fn(),
    onPreferAdbKeyboardChange: vi.fn(),
    onRunDirectAction: vi.fn(),
    onRunDoctor: vi.fn(),
    ...overrides,
  }

  return render(<DevicePanel {...props} />)
}

describe('DevicePanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows an ADB connection recovery hint next to the connect controls', () => {
    renderDevicePanel()

    const help = screen.getByRole('button', { name: 'ADB 连接帮助' })

    expect(help.closest('.adb-help')).toBeTruthy()
    expect(
      within(help.closest('.adb-help') as HTMLElement).getByText(
        '如果连接不上，请在终端输入 adb kill-server，然后重新连接设备。',
      ),
    ).toBeTruthy()
  })
})
