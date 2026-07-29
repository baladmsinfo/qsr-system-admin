// Real Capacitor Bluetooth LE driver, using @capacitor-community/bluetooth-le
// (added as a new dependency for this module - the de facto standard BLE
// plugin for Capacitor, not a UI framework). Spec-correct against that
// plugin's documented API, hardware-unverified (no physical device/emulator
// with a paired BLE printer available in this environment) and not yet
// exercised through an actual native build (`npx cap sync android` hasn't
// been run since installing this plugin - required before it'll work on a
// real device/emulator).
//
// Same "no universal service/characteristic UUID" caveat as
// webBluetoothDriver.js - required via connectionConfig, not guessed.
import { Capacitor } from '@capacitor/core'
import { PrinterDriver } from './PrinterDriver'

const BLE_WRITE_CHUNK_SIZE = 20

export class CapacitorBluetoothDriver extends PrinterDriver {
  constructor() {
    super()
    this.deviceId = null
    this.serviceUuid = null
    this.characteristicUuid = null
    this._initialized = false
  }

  static isSupported() {
    // Real support also requires the native Android/iOS project to have
    // been synced with this plugin (`npx cap sync`) - this only confirms
    // we're running inside a Capacitor native shell at all.
    return Capacitor.isNativePlatform()
  }

  async _client() {
    const { BleClient } = await import('@capacitor-community/bluetooth-le')
    if (!this._initialized) {
      await BleClient.initialize()
      this._initialized = true
    }
    return BleClient
  }

  async discoverPrinters() {
    return [] // no "list paired devices" API - always requestNewDevice()
  }

  /** Must be called from a user gesture. */
  async requestNewDevice({ serviceUuid } = {}) {
    if (!serviceUuid) throw new Error('serviceUuid is required to discover a Bluetooth printer')
    const BleClient = await this._client()
    const device = await BleClient.requestDevice({ services: [serviceUuid] })
    return { id: device.deviceId, name: device.name, raw: device }
  }

  async connect(target, { serviceUuid, characteristicUuid }) {
    if (!serviceUuid || !characteristicUuid) throw new Error('serviceUuid and characteristicUuid are required (see Printer.connectionConfig)')
    const BleClient = await this._client()
    const deviceId = target?.raw?.deviceId || target?.id || target
    await BleClient.connect(deviceId)
    this.deviceId = deviceId
    this.serviceUuid = serviceUuid
    this.characteristicUuid = characteristicUuid
    return true
  }

  async disconnect() {
    if (!this.deviceId) return
    const BleClient = await this._client()
    await BleClient.disconnect(this.deviceId)
    this.deviceId = null
  }

  async print(bytes) {
    if (!this.deviceId) throw new Error('Not connected to a Bluetooth printer')
    const BleClient = await this._client()
    for (let offset = 0; offset < bytes.length; offset += BLE_WRITE_CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + BLE_WRITE_CHUNK_SIZE)
      const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength)
      await BleClient.write(this.deviceId, this.serviceUuid, this.characteristicUuid, dataView)
    }
  }
}
