// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useBusyTask } from './useBusyTask'

describe('useBusyTask', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks the active task while an async action is running', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1234)
    let resolveAction: () => void = () => {}
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve
        }),
    )
    const { result } = renderHook(() => useBusyTask())

    let runPromise: Promise<void>
    act(() => {
      runPromise = result.current.runTask('capture-screen', 'Capture screen', action)
    })

    expect(result.current.busyTask).toEqual({
      id: 'capture-screen',
      label: 'Capture screen',
      startedAt: 1234,
    })

    await act(async () => {
      resolveAction()
      await runPromise
    })

    expect(result.current.busyTask).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('stores errors and reports them with the task label', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useBusyTask(onError))

    await act(async () => {
      await result.current.runTask('run-doctor', 'Run doctor', async () => {
        throw new Error('Device unavailable')
      })
    })

    expect(result.current.busyTask).toBeNull()
    expect(result.current.error).toBe('Device unavailable')
    expect(onError).toHaveBeenCalledWith({
      label: 'Run doctor',
      message: 'Device unavailable',
    })
  })
})
