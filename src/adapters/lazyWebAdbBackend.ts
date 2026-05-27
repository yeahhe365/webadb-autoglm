import type {
  DeviceBackend,
  DeviceInfo,
  DeviceScreenshot,
  DeviceState,
  DeviceTimingConfig,
  ExecuteActionOptions,
  InstalledApp,
} from './deviceTypes'

type WebAdbBackendModule = typeof import('./webAdbBackend')
type WebAdbBackendInstance = InstanceType<WebAdbBackendModule['WebAdbDeviceBackend']>

export class LazyWebAdbDeviceBackend implements DeviceBackend {
  #backend: WebAdbBackendInstance | null = null
  #backendPromise: Promise<WebAdbBackendInstance> | null = null
  #preferAdbKeyboard = false
  #timingConfig: DeviceTimingConfig | null = null

  async connect(): Promise<DeviceInfo> {
    return this.#loadBackend().then((backend) => backend.connect())
  }

  async disconnect(): Promise<void> {
    if (!this.#backend && !this.#backendPromise) {
      return
    }
    const backend = await this.#loadBackend()
    await backend.disconnect()
  }

  async screenshot(): Promise<DeviceScreenshot> {
    return this.#loadBackend().then((backend) => backend.screenshot())
  }

  async getCurrentApp(): Promise<string> {
    return this.#loadBackend().then((backend) => backend.getCurrentApp())
  }

  async getDeviceState(): Promise<DeviceState> {
    return this.#loadBackend().then((backend) => backend.getDeviceState())
  }

  async getScreenTree() {
    return this.#loadBackend().then((backend) => backend.getScreenTree())
  }

  async getInputMethods(): Promise<string> {
    return this.#loadBackend().then((backend) => backend.getInputMethods())
  }

  async getInstalledApps(): Promise<InstalledApp[]> {
    return this.#loadBackend().then((backend) => backend.getInstalledApps())
  }

  async installAdbKeyboard(apkBytes: Uint8Array): Promise<string> {
    return this.#loadBackend().then((backend) => backend.installAdbKeyboard(apkBytes))
  }

  async enableAdbKeyboard(): Promise<string> {
    return this.#loadBackend().then((backend) => backend.enableAdbKeyboard())
  }

  async startScreenBlackout(): Promise<string> {
    return this.#loadBackend().then((backend) => backend.startScreenBlackout())
  }

  async stopScreenBlackout(): Promise<string> {
    return this.#loadBackend().then((backend) => backend.stopScreenBlackout())
  }

  async execute(action: Parameters<DeviceBackend['execute']>[0], options?: ExecuteActionOptions) {
    return this.#loadBackend().then((backend) =>
      options === undefined ? backend.execute(action) : backend.execute(action, options),
    )
  }

  setPreferAdbKeyboard(value: boolean) {
    this.#preferAdbKeyboard = value
    this.#backend?.setPreferAdbKeyboard(value)
  }

  setTimingConfig(value: DeviceTimingConfig) {
    this.#timingConfig = value
    this.#backend?.setTimingConfig(value)
  }

  async #loadBackend() {
    if (this.#backend) {
      return this.#backend
    }

    this.#backendPromise ??= import('./webAdbBackend').then(({ WebAdbDeviceBackend }) => {
      const backend = new WebAdbDeviceBackend()
      backend.setPreferAdbKeyboard(this.#preferAdbKeyboard)
      if (this.#timingConfig) {
        backend.setTimingConfig(this.#timingConfig)
      }
      this.#backend = backend
      return backend
    })

    return this.#backendPromise
  }
}
