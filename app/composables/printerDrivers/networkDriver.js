// NETWORK printers are driven entirely by the backend (see
// services/printing/drivers/networkDriver.js + workers/printWorker.js on
// the backend, and stores/printers.js's requestPrint on this side) - this
// client-side "driver" exists only so callers can treat every connection
// type uniformly through the same PrinterDriver contract. There is no
// client-side transport here; connect()/disconnect()/print() are no-ops.
import { PrinterDriver } from './PrinterDriver'

export class NetworkDriver extends PrinterDriver {
  async discoverPrinters() {
    return [] // backend has no LAN-scan today - printers are added manually by IP:port
  }

  async connect() {
    return true // nothing to connect to client-side
  }

  async disconnect() {
    // no-op
  }

  async print() {
    throw new Error('NetworkDriver.print() should never be called directly - use printerStore.requestPrint(), which the backend executes')
  }
}
