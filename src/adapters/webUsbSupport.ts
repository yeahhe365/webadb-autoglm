export function isWebUsbSupported() {
  return typeof navigator !== 'undefined' && 'usb' in navigator
}
