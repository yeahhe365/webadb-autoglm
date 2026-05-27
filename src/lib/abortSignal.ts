export function createAbortError(message = 'Run stopped.') {
  return new DOMException(message, 'AbortError')
}

export function isAbortError(caught: unknown) {
  return (
    (caught instanceof DOMException && caught.name === 'AbortError') ||
    (caught instanceof Error && caught.name === 'AbortError')
  )
}

export function throwIfAborted(signal?: AbortSignal, message?: string) {
  if (signal?.aborted) {
    throw createAbortError(message)
  }
}

export function withAbort<T>(
  promise: Promise<T>,
  signal?: AbortSignal,
  message?: string,
): Promise<T> {
  if (!signal) {
    return promise
  }
  if (signal.aborted) {
    return Promise.reject(createAbortError(message))
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      signal.removeEventListener('abort', abort)
      callback()
    }

    function abort() {
      finish(() => reject(createAbortError(message)))
    }

    signal.addEventListener('abort', abort, { once: true })
    promise.then(
      (value) => finish(() => resolve(value)),
      (error) => finish(() => reject(error)),
    )
  })
}

export function delayWithAbort(ms: number, signal?: AbortSignal, message?: string) {
  throwIfAborted(signal, message)
  if (ms <= 0) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false
    const timeoutId = globalThis.setTimeout(() => {
      finish(() => resolve())
    }, ms)

    const finish = (callback: () => void) => {
      if (settled) {
        return
      }
      settled = true
      globalThis.clearTimeout(timeoutId)
      signal?.removeEventListener('abort', abort)
      callback()
    }

    function abort() {
      finish(() => reject(createAbortError(message)))
    }

    signal?.addEventListener('abort', abort, { once: true })
  })
}
