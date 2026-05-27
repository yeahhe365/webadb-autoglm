export const UI_AUTOMATOR_DUMP_PATH = '/sdcard/webdroid-window-dump.xml'

export type ScreenTreeBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

export type ScreenTreeNode = {
  index: number
  text?: string
  contentDescription?: string
  resourceId?: string
  className?: string
  packageName?: string
  clickable?: boolean
  focusable?: boolean
  focused?: boolean
  enabled?: boolean
  selected?: boolean
  bounds?: ScreenTreeBounds
}

export type DeviceScreenTree = {
  nodes: ScreenTreeNode[]
}

export function buildDumpScreenTreeCommand(path = UI_AUTOMATOR_DUMP_PATH) {
  return ['uiautomator', 'dump', '--compressed', path]
}

export function buildReadScreenTreeCommand(path = UI_AUTOMATOR_DUMP_PATH) {
  return ['cat', path]
}

export function buildRemoveScreenTreeCommand(path = UI_AUTOMATOR_DUMP_PATH) {
  return ['rm', '-f', path]
}

export function parseUiAutomatorDumpXml(xml: string): DeviceScreenTree {
  const nodes: ScreenTreeNode[] = []
  const nodePattern = /<node\b([^>]*)\/?>/gi
  let match: RegExpExecArray | null

  while ((match = nodePattern.exec(xml)) !== null) {
    const attributes = parseXmlAttributes(match[1])
    const bounds = parseBounds(attributes.bounds)
    nodes.push({
      index: nodes.length,
      ...(attributes.text ? { text: attributes.text } : {}),
      ...(attributes['content-desc'] ? { contentDescription: attributes['content-desc'] } : {}),
      ...(attributes['resource-id'] ? { resourceId: attributes['resource-id'] } : {}),
      ...(attributes.class ? { className: attributes.class } : {}),
      ...(attributes.package ? { packageName: attributes.package } : {}),
      ...optionalBoolean('clickable', attributes.clickable),
      ...optionalBoolean('focusable', attributes.focusable),
      ...optionalBoolean('focused', attributes.focused),
      ...optionalBoolean('enabled', attributes.enabled),
      ...optionalBoolean('selected', attributes.selected),
      ...(bounds ? { bounds } : {}),
    })
  }

  return { nodes }
}

export function formatScreenTreeForPrompt(
  tree?: DeviceScreenTree,
  options: { maxNodes?: number } = {},
) {
  const maxNodes = options.maxNodes ?? 80
  const nodes = (tree?.nodes ?? []).filter(isPromptUsefulNode).slice(0, maxNodes)
  if (nodes.length === 0) {
    return null
  }

  return [
    '<screen_tree>',
    ...nodes.map(formatScreenTreeNode),
    tree && tree.nodes.filter(isPromptUsefulNode).length > nodes.length
      ? `... truncated ${tree.nodes.filter(isPromptUsefulNode).length - nodes.length} more nodes`
      : null,
    '</screen_tree>',
    [
      'Use screen_tree text, content descriptions, resource ids, bounds, and centers to choose',
      'more accurate tap/input targets; verify visually with the screenshot when a node may be stale.',
    ].join(' '),
  ]
    .filter(Boolean)
    .join('\n')
}

function parseXmlAttributes(raw: string) {
  const attributes: Record<string, string> = {}
  const pattern = /([\w:-]+)="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw)) !== null) {
    attributes[match[1]] = decodeXmlAttribute(match[2])
  }
  return attributes
}

function parseBounds(value?: string): ScreenTreeBounds | undefined {
  if (!value) {
    return undefined
  }
  const match = value.match(/^\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]$/)
  if (!match) {
    return undefined
  }
  return {
    left: Number(match[1]),
    top: Number(match[2]),
    right: Number(match[3]),
    bottom: Number(match[4]),
  }
}

function optionalBoolean(key: keyof ScreenTreeNode, value?: string) {
  if (value !== 'true' && value !== 'false') {
    return {}
  }
  return { [key]: value === 'true' }
}

function isPromptUsefulNode(node: ScreenTreeNode) {
  return Boolean(
    node.text ||
      node.contentDescription ||
      node.resourceId ||
      node.focused ||
      node.clickable ||
      node.focusable,
  )
}

function formatScreenTreeNode(node: ScreenTreeNode) {
  const parts = [
    `#${node.index}`,
    node.bounds ? `bounds=${formatBounds(node.bounds)}` : null,
    node.bounds ? `center=${formatCenter(node.bounds)}` : null,
    node.className ? `class=${node.className}` : null,
    node.resourceId ? `id=${node.resourceId}` : null,
    node.text ? `text=${JSON.stringify(truncate(node.text, 80))}` : null,
    node.contentDescription
      ? `desc=${JSON.stringify(truncate(node.contentDescription, 80))}`
      : null,
    node.clickable ? 'clickable=true' : null,
    node.focusable ? 'focusable=true' : null,
    node.focused ? 'focused=true' : null,
    node.enabled === false ? 'enabled=false' : null,
    node.selected ? 'selected=true' : null,
  ].filter(Boolean)
  return parts.join(' ')
}

function formatBounds(bounds: ScreenTreeBounds) {
  return `[${bounds.left},${bounds.top}][${bounds.right},${bounds.bottom}]`
}

function formatCenter(bounds: ScreenTreeBounds) {
  return `(${Math.round((bounds.left + bounds.right) / 2)},${Math.round(
    (bounds.top + bounds.bottom) / 2,
  )})`
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}...`
}

function decodeXmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}
