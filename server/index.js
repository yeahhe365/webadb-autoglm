import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createOpenAiProxyHandler, isOpenAiProxyRequest } from './openAiProxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultDistDir = path.resolve(__dirname, '../dist')
const port = Number(process.env.PORT || 8080)
const host = process.env.HOST || '0.0.0.0'

export function createWebDroidServer({
  distDir = defaultDistDir,
  openAiProxyHandler = createOpenAiProxyHandler(),
} = {}) {
  const staticRoot = path.resolve(distDir)

  return createServer(async (request, response) => {
    if (isOpenAiProxyRequest(request.url)) {
      await openAiProxyHandler(request, response)
      return
    }

    if (requestPathname(request.url) === '/healthz') {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ ok: true }))
      return
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' })
      response.end()
      return
    }

    await serveStatic(request, response, staticRoot)
  })
}

if (isMainModule()) {
  const server = createWebDroidServer()
  server.listen(port, host, () => {
    console.log(`WebDroid Agent listening on http://${host}:${port}`)
  })
}

async function serveStatic(request, response, distDir) {
  const requestPath = safeRequestPath(request.url)
  if (!requestPath) {
    response.writeHead(400)
    response.end()
    return
  }

  const filePath = path.join(distDir, requestPath)
  const resolvedPath = path.resolve(filePath)
  const indexPath = path.join(distDir, 'index.html')

  if (!isPathInside(resolvedPath, distDir)) {
    response.writeHead(403)
    response.end()
    return
  }

  const pathToServe = await readableFilePath(resolvedPath, indexPath)
  if (!pathToServe) {
    response.writeHead(404)
    response.end()
    return
  }

  response.writeHead(200, responseHeaders(pathToServe, distDir))
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(pathToServe).pipe(response)
}

function safeRequestPath(requestUrl = '/') {
  try {
    const url = new URL(requestUrl, 'http://localhost')
    const pathname = decodeURIComponent(url.pathname)
    if (pathname === '/') {
      return 'index.html'
    }
    return pathname.replace(/^\/+/, '')
  } catch {
    return null
  }
}

function isPathInside(candidatePath, rootPath) {
  const relativePath = path.relative(rootPath, candidatePath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

async function readableFilePath(candidatePath, indexPath) {
  const directFilePath = await filePathIfReadable(candidatePath)
  if (directFilePath) {
    return directFilePath
  }

  if (!path.extname(candidatePath)) {
    return filePathIfReadable(indexPath)
  }

  return null
}

async function filePathIfReadable(candidatePath) {
  try {
    const info = await stat(candidatePath)
    if (info.isFile()) {
      return candidatePath
    }
  } catch {
    return null
  }

  return null
}

function contentType(filePath) {
  const extension = path.extname(filePath)
  if (extension === '.html') {
    return 'text/html; charset=utf-8'
  }
  if (extension === '.js') {
    return 'text/javascript; charset=utf-8'
  }
  if (extension === '.css') {
    return 'text/css; charset=utf-8'
  }
  if (extension === '.png') {
    return 'image/png'
  }
  if (extension === '.svg') {
    return 'image/svg+xml'
  }
  if (extension === '.json') {
    return 'application/json; charset=utf-8'
  }
  return 'application/octet-stream'
}

function responseHeaders(filePath, distDir) {
  return {
    'Content-Type': contentType(filePath),
    'Cache-Control': cacheControl(filePath, distDir),
  }
}

function cacheControl(filePath, distDir) {
  const relativePath = path.relative(distDir, filePath).replaceAll(path.sep, '/')
  if (relativePath === 'index.html' || path.extname(filePath) === '.html') {
    return 'no-cache'
  }
  if (relativePath.startsWith('assets/')) {
    return 'public, max-age=31536000, immutable'
  }
  return 'public, max-age=3600'
}

function isMainModule() {
  const entrypoint = process.argv[1]
  return Boolean(entrypoint) && import.meta.url === pathToFileURL(entrypoint).href
}

function requestPathname(requestUrl) {
  try {
    return new URL(requestUrl ?? '/', 'http://localhost').pathname
  } catch {
    return null
  }
}
