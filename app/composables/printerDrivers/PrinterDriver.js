/**
 * Base contract every client-side printer driver implements. A "driver"
 * here only ever handles connection types where THIS device (browser tab or
 * Capacitor app) holds the actual hardware handle - NETWORK printers are
 * driven entirely by the backend (see printers.js store's requestPrint) and
 * only need the thin passthrough driver in networkDriver.js for interface
 * consistency.
 *
 * printHTML()/printPDF() are real methods on this contract, but most
 * transports (USB/Bluetooth/Serial - all raw byte pipes to a thermal
 * printer) have no way to render HTML/PDF themselves; those throw a clear
 * "not supported on this transport" error rather than silently no-op'ing -
 * see systemDriver.js for the one driver where HTML/PDF genuinely works
 * (the OS/browser print dialog).
 */
export class PrinterDriver {
  /** @returns {Promise<Array<{id: string, name: string, raw: any}>>} previously-authorized/paired devices */
  async discoverPrinters() {
    throw new Error('discoverPrinters() not implemented for this driver')
  }

  /** @returns {Promise<Array<{id: string, name: string, raw: any}>>} triggers the browser/OS device picker - MUST be called from a user gesture (click handler) */
  async requestNewDevice() {
    throw new Error('requestNewDevice() not implemented for this driver')
  }

  async connect(target) {
    throw new Error('connect() not implemented for this driver')
  }

  async disconnect() {
    throw new Error('disconnect() not implemented for this driver')
  }

  /** @param {Uint8Array} bytes - raw bytes, transport-agnostic */
  async print(bytes) {
    throw new Error('print() not implemented for this driver')
  }

  async printEscPos(bytes) {
    return this.print(bytes)
  }

  async printHTML(html) {
    throw new Error('This driver cannot print HTML directly - render to ESC/POS server-side, or use the System/AirPrint driver')
  }

  async printPDF(pdfBytes) {
    throw new Error('This driver cannot print PDF directly - use the System/AirPrint driver for PDF/system printing')
  }

  async cut() {
    const { cutBytes } = await import('./escposBytes')
    return this.print(cutBytes())
  }

  async feed(lines = 1) {
    const { feedBytes } = await import('./escposBytes')
    return this.print(feedBytes(lines))
  }

  async beep() {
    const { beepBytes } = await import('./escposBytes')
    return this.print(beepBytes())
  }

  async openDrawer() {
    const { openDrawerBytes } = await import('./escposBytes')
    return this.print(openDrawerBytes())
  }

  async testPrint(printerName) {
    const { testPrintBytes } = await import('./escposBytes')
    return this.print(testPrintBytes(printerName))
  }
}
