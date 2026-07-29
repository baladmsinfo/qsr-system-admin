// Real Web Bluetooth (navigator.bluetooth) driver - spec-correct against the
// W3C Web Bluetooth API, hardware-unverified. Chrome/Edge/Android Chrome
// only (no Safari/iOS support at all - that's what CapacitorDriver's native
// BLE plugin is for on iOS).
//
// Unlike USB/Serial, BLE thermal printers have NO universal service/
// characteristic UUID - it genuinely varies by manufacturer/chipset, so
// this driver requires them in the Printer's connectionConfig
// (serviceUuid/characteristicUuid) rather than guessing a "default" that
// would silently fail on hardware it wasn't guessed correctly for.
import { PrinterDriver } from './PrinterDriver'

const BLE_WRITE_CHUNK_SIZE = 20 // conservative default ATT MTU payload

export class WebBluetoothDriver extends PrinterDriver {
  constructor() {
    super()
    this.gattServer = null
    this.characteristic = null
  }

  static isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator
  }

  /** Web Bluetooth has no getDevices() to list previously-paired printers without a picker - always requires requestNewDevice(). */
  async discoverPrinters() {
    return []
  }

  /** Must be called from a user gesture. serviceUuid required so the browser's device picker only shows compatible devices. */
  async requestNewDevice({ serviceUuid } = {}) {
    if (!serviceUuid) throw new Error('serviceUuid is required to discover a Bluetooth printer')
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [serviceUuid] }],
    })
    return { id: device.id, name: device.name, raw: device }
  }

  async connect(target, { serviceUuid, characteristicUuid }) {
    if (!serviceUuid || !characteristicUuid) throw new Error('serviceUuid and characteristicUuid are required (see Printer.connectionConfig)')
    const device = target?.raw || target
    this.gattServer = await device.gatt.connect()
    const service = await this.gattServer.getPrimaryService(serviceUuid)
    this.characteristic = await service.getCharacteristic(characteristicUuid)
    return true
  }

  async disconnect() {
    this.gattServer?.disconnect()
    this.gattServer = null
    this.characteristic = null
  }

  async print(bytes) {
    if (!this.characteristic) throw new Error('Not connected to a Bluetooth printer')
    for (let offset = 0; offset < bytes.length; offset += BLE_WRITE_CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + BLE_WRITE_CHUNK_SIZE)
      await this.characteristic.writeValueWithoutResponse(chunk)
    }
  }
}
