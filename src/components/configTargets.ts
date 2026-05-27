export type ConfigTarget = 'model' | 'device'

export const CONFIG_TARGET_IDS: Record<ConfigTarget, string> = {
  device: 'config-device',
  model: 'config-model',
}
