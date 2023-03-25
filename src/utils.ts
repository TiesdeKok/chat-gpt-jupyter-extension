import Browser from 'webextension-polyfill'

export function getExtensionVersion() {
  return Browser.runtime.getManifest().version
}
