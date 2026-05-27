import { useCallback, useState } from 'react'
import type { BusyTask, BusyTaskId } from '../lib/busyTask'

export type BusyTaskError = {
  label: string
  message: string
}

export function useBusyTask(onError?: (error: BusyTaskError) => void) {
  const [busyTask, setBusyTask] = useState<BusyTask | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTask = useCallback(
    async (id: BusyTaskId, label: string, action: () => Promise<void>) => {
      setBusyTask({ id, label, startedAt: Date.now() })
      setError(null)
      try {
        await action()
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught)
        setError(message)
        onError?.({ label, message })
      } finally {
        setBusyTask(null)
      }
    },
    [onError],
  )

  return {
    busyTask,
    error,
    runTask,
    setError,
  }
}
