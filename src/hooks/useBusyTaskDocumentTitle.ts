import { useEffect, useRef, type MutableRefObject } from 'react'
import type { BusyTask } from '../lib/busyTask'

export function useBusyTaskDocumentTitle(busyTask: BusyTask | null) {
  const baseTitleRef = useRef<string | null>(null)

  useEffect(() => {
    if (!busyTask) {
      restoreDocumentTitle(baseTitleRef)
      return
    }

    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title
    }

    const syncTitle = () => {
      document.title = formatBusyTaskDocumentTitle(busyTask, Date.now(), baseTitleRef.current)
    }

    syncTitle()
    const intervalId = window.setInterval(syncTitle, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [busyTask])

  useEffect(
    () => () => {
      restoreDocumentTitle(baseTitleRef)
    },
    [],
  )
}

export function formatBusyTaskDocumentTitle(
  busyTask: BusyTask,
  now: number,
  baseTitle: string | null,
) {
  const elapsedSeconds = Math.max(0, Math.floor((now - busyTask.startedAt) / 1000))
  return `${elapsedSeconds}s · ${busyTask.label} · ${baseTitle || 'WebDroid Agent'}`
}

function restoreDocumentTitle(baseTitleRef: MutableRefObject<string | null>) {
  if (baseTitleRef.current === null) {
    return
  }
  document.title = baseTitleRef.current
  baseTitleRef.current = null
}
