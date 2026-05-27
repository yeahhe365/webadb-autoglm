import type { ScreenSize } from '../lib/actionTypes'
import {
  chooseGridDivisions,
  fitDimensionsToMaxSide,
  MODEL_SCREENSHOT_MAX_SIDE,
  MODEL_SCREENSHOT_MIME_TYPE,
  MODEL_SCREENSHOT_QUALITY,
} from '../lib/screenshot'

export type PreprocessedScreenshot = {
  modelDataUrl: string
  modelScreen: ScreenSize
  modelGridDivisions: number
}

export type ScreenshotPreprocessInput = {
  dataUrl: string
  screen: ScreenSize
  drawGrid?: boolean
  maxSide?: number
  mimeType?: string
  quality?: number
}

export async function preprocessScreenshotForModel({
  dataUrl,
  screen,
  drawGrid = true,
  maxSide = MODEL_SCREENSHOT_MAX_SIDE,
  mimeType = MODEL_SCREENSHOT_MIME_TYPE,
  quality = MODEL_SCREENSHOT_QUALITY,
}: ScreenshotPreprocessInput): Promise<PreprocessedScreenshot> {
  const modelScreen = fitDimensionsToMaxSide(screen, maxSide)
  const modelGridDivisions = chooseGridDivisions(modelScreen)
  const unchangedSize = modelScreen.width === screen.width && modelScreen.height === screen.height
  const alreadyEncodedForModel = dataUrl.startsWith(`data:${mimeType};`)

  if (!drawGrid && unchangedSize && alreadyEncodedForModel) {
    return { modelDataUrl: dataUrl, modelScreen, modelGridDivisions }
  }

  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = modelScreen.width
  canvas.height = modelScreen.height

  try {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not create screenshot preprocessing canvas.')
    }

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, modelScreen.width, modelScreen.height)

    if (drawGrid) {
      drawCoordinateGrid(context, modelScreen, modelGridDivisions)
    }

    return {
      modelDataUrl: await encodeCanvasDataUrl(canvas, mimeType, quality),
      modelScreen,
      modelGridDivisions,
    }
  } finally {
    if (typeof image.removeAttribute === 'function') {
      image.removeAttribute('src')
    }
    canvas.width = 0
    canvas.height = 0
  }
}

const CANVAS_TO_BLOB_FALLBACK_MS = 250

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      image.onload = null
      image.onerror = null
      resolve(image)
    }
    image.onerror = () => {
      image.onload = null
      image.onerror = null
      reject(new Error('Could not load screenshot for preprocessing.'))
    }
    image.src = dataUrl
  })
}

function encodeCanvasDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
) {
  if (typeof canvas.toBlob !== 'function') {
    return Promise.resolve(canvas.toDataURL(mimeType, quality))
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false
    const finish = (result: string) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(fallbackTimer)
      resolve(result)
    }
    const fail = (error: Error) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(fallbackTimer)
      reject(error)
    }
    const fallbackTimer = setTimeout(() => {
      finish(canvas.toDataURL(mimeType, quality))
    }, CANVAS_TO_BLOB_FALLBACK_MS)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          fail(new Error('Could not encode screenshot preprocessing canvas.'))
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result === 'string') {
            finish(result)
            return
          }
          fail(new Error('Could not read screenshot preprocessing blob.'))
        }
        reader.onerror = () =>
          fail(reader.error ?? new Error('Could not read screenshot preprocessing blob.'))
        reader.readAsDataURL(blob)
      },
      mimeType,
      quality,
    )
  })
}

function drawCoordinateGrid(
  context: CanvasRenderingContext2D,
  screen: ScreenSize,
  divisions: number,
) {
  if (divisions <= 0 || screen.width <= 0 || screen.height <= 0) {
    return
  }

  context.save()
  context.font = '12px sans-serif'
  context.textBaseline = 'top'

  for (let index = 0; index <= divisions; index += 1) {
    const x = Math.round((index * (screen.width - 1)) / divisions)
    const y = Math.round((index * (screen.height - 1)) / divisions)
    const isMajor = index === 0 || index === Math.floor(divisions / 2) || index === divisions
    context.strokeStyle = isMajor ? 'rgba(255, 230, 120, 0.43)' : 'rgba(255, 255, 255, 0.27)'
    context.lineWidth = 1

    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, screen.height - 1)
    context.moveTo(0, y)
    context.lineTo(screen.width - 1, y)
    context.stroke()

    if (isMajor) {
      drawLabel(context, `x=${x}`, Math.min(x + 3, Math.max(4, screen.width - 40)), 4)
      drawLabel(context, `y=${y}`, 4, Math.min(y + 3, Math.max(4, screen.height - 16)))
    }
  }

  context.restore()
}

function drawLabel(context: CanvasRenderingContext2D, text: string, x: number, y: number) {
  const metrics = context.measureText(text)
  const width = metrics.width
  const height = 13

  context.fillStyle = 'rgba(0, 0, 0, 0.45)'
  context.fillRect(x - 2, y - 1, width + 4, height + 2)
  context.fillStyle = 'rgba(0, 0, 0, 0.75)'
  context.fillText(text, x + 1, y + 1)
  context.fillStyle = 'rgba(255, 255, 255, 0.9)'
  context.fillText(text, x, y)
}
