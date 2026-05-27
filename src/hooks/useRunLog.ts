import { useCallback, useState } from 'react'
import {
  createRunLogEntry,
  type LogEntry,
  type LogEntryInput,
} from '../lib/runLogEntries'

export const MAX_RUN_LOG_ENTRIES = 80
export const MAX_RUN_LOG_SCREENSHOTS = 6

export function useRunLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((entry: LogEntryInput) => {
    setLogs((current) => trimLogEntries([createRunLogEntry(entry), ...current]))
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    logs,
    addLog,
    clearLogs,
  }
}

function trimLogEntries(entries: LogEntry[]) {
  let screenshotCount = 0

  return entries.slice(0, MAX_RUN_LOG_ENTRIES).map((entry) => {
    if (!entry.screenshot) {
      return entry
    }

    screenshotCount += 1
    if (screenshotCount <= MAX_RUN_LOG_SCREENSHOTS) {
      return entry
    }

    const entryWithoutScreenshot = { ...entry }
    delete entryWithoutScreenshot.screenshot
    return entryWithoutScreenshot
  })
}
