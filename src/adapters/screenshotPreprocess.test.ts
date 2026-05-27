// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { preprocessScreenshotForModel } from './screenshotPreprocess'

class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

describe('preprocessScreenshotForModel', () => {
  const originalImage = globalThis.Image

  afterEach(() => {
    globalThis.Image = originalImage
    vi.restoreAllMocks()
  })

  it('resizes and encodes model screenshots as compressed JPEG by default', async () => {
    globalThis.Image = FakeImage as unknown as typeof Image
    const canvas = document.createElement('canvas')
    Object.defineProperty(canvas, 'toBlob', { configurable: true, value: undefined })
    const context = {
      beginPath: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      lineTo: vi.fn(),
      measureText: vi.fn(() => ({ width: 24 }) as TextMetrics),
      moveTo: vi.fn(),
      restore: vi.fn(),
      save: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(_value: string) {},
      set font(_value: string) {},
      set imageSmoothingEnabled(_value: boolean) {},
      set imageSmoothingQuality(_value: ImageSmoothingQuality) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
      set textBaseline(_value: CanvasTextBaseline) {},
    } as unknown as CanvasRenderingContext2D
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(canvas)
    const getContext = vi.spyOn(canvas, 'getContext').mockReturnValue(context)
    const toDataURL = vi
      .spyOn(canvas, 'toDataURL')
      .mockReturnValue('data:image/jpeg;base64,compressed')

    const result = await preprocessScreenshotForModel({
      dataUrl: 'data:image/png;base64,raw',
      screen: { width: 1080, height: 2316 },
    })

    expect(createElement).toHaveBeenCalledWith('canvas')
    expect(getContext).toHaveBeenCalledWith('2d')
    expect(context.drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0, 716, 1536)
    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.82)
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
    expect(result).toEqual({
      modelDataUrl: 'data:image/jpeg;base64,compressed',
      modelScreen: { width: 716, height: 1536 },
      modelGridDivisions: 8,
    })
  })

  it('re-encodes unscaled PNG screenshots when grid drawing is disabled', async () => {
    globalThis.Image = FakeImage as unknown as typeof Image
    const canvas = document.createElement('canvas')
    Object.defineProperty(canvas, 'toBlob', { configurable: true, value: undefined })
    vi.spyOn(document, 'createElement').mockReturnValue(canvas)
    vi.spyOn(canvas, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      set imageSmoothingEnabled(_value: boolean) {},
      set imageSmoothingQuality(_value: ImageSmoothingQuality) {},
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/jpeg;base64,compressed')

    await expect(
      preprocessScreenshotForModel({
        dataUrl: 'data:image/png;base64,raw',
        screen: { width: 720, height: 1280 },
        drawGrid: false,
      }),
    ).resolves.toMatchObject({
      modelDataUrl: 'data:image/jpeg;base64,compressed',
      modelScreen: { width: 720, height: 1280 },
    })
  })

  it('keeps already-compressed screenshots when no preprocessing is requested', async () => {
    const createElement = vi.spyOn(document, 'createElement')

    const result = await preprocessScreenshotForModel({
      dataUrl: 'data:image/jpeg;base64,ready',
      screen: { width: 720, height: 1280 },
      drawGrid: false,
    })

    expect(createElement).not.toHaveBeenCalled()
    expect(result).toEqual({
      modelDataUrl: 'data:image/jpeg;base64,ready',
      modelScreen: { width: 720, height: 1280 },
      modelGridDivisions: 6,
    })
  })
})
