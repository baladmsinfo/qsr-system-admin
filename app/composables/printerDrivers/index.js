// Factory: given a Printer row (connectionType + whether we're running
// inside a Capacitor native shell or a plain browser tab), returns the
// right PrinterDriver implementation. This is the single place that decides
// "browser vs Capacitor" - callers (Test Printer page, checkout print flow)
// never branch on platform themselves.
import { Capacitor } from '@capacitor/core'
import { WebUsbDriver } from './webUsbDriver'
import { WebSerialDriver } from './webSerialDriver'
import { WebBluetoothDriver } from './webBluetoothDriver'
import { CapacitorBluetoothDriver } from './capacitorBluetoothDriver'
import { NetworkDriver } from './networkDriver'
import { SystemDriver } from './systemDriver'

function isCapacitorNative() {
  return Capacitor.isNativePlatform()
}

/** @param {{connectionType: string}} printer */
export function getDriverFor(printer) {
  switch (printer.connectionType) {
    case 'NETWORK':
      return new NetworkDriver()
    case 'SYSTEM':
      return new SystemDriver()
    case 'WEBUSB':
    case 'USB':
      // Real native USB printing (not just WebUSB-in-a-WebView) would need
      // a further Capacitor USB-serial plugin, which isn't installed - USB
      // on Capacitor native currently falls back to WebUSB support in the
      // underlying WebView, which varies by device/OS and isn't guaranteed.
      return new WebUsbDriver()
    case 'WEBSERIAL':
      return new WebSerialDriver()
    case 'BLUETOOTH':
      return isCapacitorNative() ? new CapacitorBluetoothDriver() : new WebBluetoothDriver()
    default:
      throw new Error(`No client-side driver available for connection type: ${printer.connectionType}`)
  }
}

export function isDriverSupported(connectionType) {
  switch (connectionType) {
    case 'NETWORK':
    case 'SYSTEM':
      return true
    case 'WEBUSB':
    case 'USB':
      return WebUsbDriver.isSupported()
    case 'WEBSERIAL':
      return WebSerialDriver.isSupported()
    case 'BLUETOOTH':
      return isCapacitorNative() ? true : WebBluetoothDriver.isSupported()
    default:
      return false
  }
}
