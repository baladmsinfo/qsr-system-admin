// Real WebUSB (navigator.usb) driver - spec-correct against the actual W3C
// WebUSB API, but not hardware-verified: this environment has no physical
// USB thermal printer attached to test against. Chrome/Edge only (WebUSB
// isn't implemented in Firefox/Safari) - callers should feature-detect via
// isSupported() before offering this connection type in the UI.
import { PrinterDriver } from './PrinterDriver'

// Common thermal-printer USB class - most cheap ESC/POS printers expose a
// vendor-specific (0xff) or printer-class (0x07) interface with one bulk-OUT
// endpoint; connect() searches for the first bulk-OUT endpoint on any
// interface rather than assuming a fixed interface number, since that
// varies by manufacturer.
export class WebUsbDriver extends PrinterDriver {
  constructor() {
    super()
    this.device = null
    this.endpointOut = null
    this.interfaceNumber = null
  }

  static isSupported() {
    return typeof navigator !== 'undefined' && 'usb' in navigator
  }

  async discoverPrinters() {
    if (!WebUsbDriver.isSupported()) return []
    const devices = await navigator.usb.getDevices()
    return devices.map((d) => ({ id: `${d.vendorId}:${d.productId}`, name: d.productName || `USB ${d.vendorId.toString(16)}:${d.productId.toString(16)}`, raw: d }))
  }

  /** Must be called from a user gesture (button click) - the browser blocks navigator.usb.requestDevice() otherwise. */
  async requestNewDevice(filters = []) {
    const device = await navigator.usb.requestDevice({ filters })
    return { id: `${device.vendorId}:${device.productId}`, name: device.productName, raw: device }
  }

  async connect(target) {
    const device = target?.raw || target
    await device.open()
    if (!device.configuration) await device.selectConfiguration(1)

    let found = null
    for (const iface of device.configuration.interfaces) {
      const alt = iface.alternates[0]
      const outEndpoint = alt.endpoints.find((e) => e.direction === 'out')
      if (outEndpoint) {
        found = { interfaceNumber: iface.interfaceNumber, endpointNumber: outEndpoint.endpointNumber }
        break
      }
    }
    if (!found) throw new Error('No bulk-OUT endpoint found on this USB device - is it a printer?')

    await device.claimInterface(found.interfaceNumber)
    this.device = device
    this.interfaceNumber = found.interfaceNumber
    this.endpointOut = found.endpointNumber
    return true
  }

  async disconnect() {
    if (!this.device) return
    try {
      await this.device.releaseInterface(this.interfaceNumber)
      await this.device.close()
    } finally {
      this.device = null
      this.endpointOut = null
    }
  }

  async print(bytes) {
    if (!this.device || this.endpointOut == null) throw new Error('Not connected to a USB printer')
    await this.device.transferOut(this.endpointOut, bytes)
  }
}
