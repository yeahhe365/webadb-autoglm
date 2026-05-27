export type BusyTaskId =
  | 'capture-screen'
  | 'configure-adb-keyboard'
  | 'connect-device'
  | 'direct-command'
  | 'disconnect-device'
  | 'execute-action'
  | 'run-agent'
  | 'run-doctor'

export type BusyTask = {
  id: BusyTaskId
  label: string
  startedAt: number
}
