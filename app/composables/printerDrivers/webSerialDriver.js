// Real WebSerial (navigator.serial) driver - spec-correct against the W3C
// Web Serial API, hardware-unverified (no physical serial thermal printer
// attached in this environment). Chrome/Edge only, same as WebUSB.
import { PrinterDriver } from './PrinterDriver'

export class WebSerialDriver extends PrinterDriver {
  constructor() {
    super()
    this.port = null
    this.writer = null
  }

  static isSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator
  }

  async discoverPrinters() {
    if (!WebSerialDriver.isSupported()) return []
    const ports = await navigator.serial.getPorts()
    return ports.map((p, i) => ({ id: `serial-${i}`, name: `Serial Port ${i + 1}`, raw: p }))
  }

  /** Must be called from a user gesture. */
  async requestNewDevice(filters = []) {
    const port = await navigator.serial.requestPort({ filters })
    return { id: 'serial-new', name: 'Serial Printer', raw: port }
  }

  async connect(target, { baudRate = 9600 } = {}) {
    const port = target?.raw || target
    await port.open({ baudRate })
    this.port = port
    this.writer = port.writable.getWriter()
    return true
  }

  async disconnect() {
    if (!this.port) return
    try {
      this.writer?.releaseLock()
      await this.port.close()
    } finally {
      this.port = null
      this.writer = null
    }
  }

  async print(bytes) {
    if (!this.writer) throw new Error('Not connected to a serial printer')
    await this.writer.write(bytes)
  }
}
