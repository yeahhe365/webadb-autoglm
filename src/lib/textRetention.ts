const DEFAULT_TRUNCATION_SUFFIX = '\n...[truncated]'

export function truncateRetainedText(
  value: string,
  maxLength: number,
  suffix = DEFAULT_TRUNCATION_SUFFIX,
) {
  if (value.length <= maxLength) {
    return value
  }

  const retainedLength = Math.max(0, maxLength - suffix.length)
  return `${value.slice(0, retainedLength)}${suffix}`
}

export function truncateOptionalRetainedText(
  value: string | undefined,
  maxLength: number,
) {
  return value === undefined ? undefined : truncateRetainedText(value, maxLength)
}

export function truncateRetainedTailText(
  value: string,
  maxLength: number,
  prefix = '[truncated]...\n',
) {
  if (value.length <= maxLength) {
    return value
  }

  const retainedLength = Math.max(0, maxLength - prefix.length)
  return `${prefix}${value.slice(value.length - retainedLength)}`
}
