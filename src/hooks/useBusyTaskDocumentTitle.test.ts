// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BusyTask } from '../lib/busyTask'
import {
  formatBusyTaskDocumentTitle,
  useBusyTaskDocumentTitle,
} from './useBusyTaskDocumentTitle'

type HookProps = {
  busyTask: BusyTask | null
}

const baseTitle = 'WebDroid Agent'

describe('useBusyTaskDocumentTitle', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.title = baseTitle
  })

  it('formats the elapsed seconds, task label, and base title', () => {
    expect(
      formatBusyTaskDocumentTitle(
        { id: 'run-agent', label: 'Run agent', startedAt: 1000 },
        3450,
        baseTitle,
      ),
    ).toBe('2s · Run agent · WebDroid Agent')
  })

  it('updates the document title every second while a task is running', () => {
    document.title = baseTitle
    vi.useFakeTimers()
    vi.setSystemTime(1000)

    const busyTask: BusyTask = {
      id: 'run-agent',
      label: 'Run agent',
      startedAt: Date.now(),
    }
    const initialProps: HookProps = { busyTask }
    const { rerender } = renderHook(
      ({ busyTask }: HookProps) => useBusyTaskDocumentTitle(busyTask),
      { initialProps },
    )

    expect(document.title).toBe('0s · Run agent · WebDroid Agent')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(document.title).toBe('2s · Run agent · WebDroid Agent')

    rerender({ busyTask: null })

    expect(document.title).toBe(baseTitle)
  })

  it('restores the base title when the component unmounts during a task', () => {
    document.title = baseTitle
    vi.useFakeTimers()
    vi.setSystemTime(1000)

    const { unmount } = renderHook(
      ({ busyTask }: HookProps) => useBusyTaskDocumentTitle(busyTask),
      {
        initialProps: {
          busyTask: {
            id: 'connect-device',
            label: 'Connect device',
            startedAt: Date.now(),
          },
        },
      },
    )

    expect(document.title).toBe('0s · Connect device · WebDroid Agent')

    unmount()

    expect(document.title).toBe(baseTitle)
  })
})
