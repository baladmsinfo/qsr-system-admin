// System/AirPrint driver - the one driver that genuinely handles
// printHTML()/printPDF() correctly, because it uses the actual browser/OS
// print dialog rather than a raw byte transport. Real and fully testable in
// this environment (no hardware needed) - window.print() on a hidden
// iframe is standard, well-supported behavior in every browser and in a
// Capacitor WebView alike (which is what makes it double as the AirPrint/
// system-print-sheet path on iOS - Capacitor's WebView delegates to the
// native print UI same as Safari does).
import { PrinterDriver } from './PrinterDriver'

export class SystemDriver extends PrinterDriver {
  async discoverPrinters() {
    return [{ id: 'system', name: 'System Print Dialog', raw: null }]
  }

  async connect() {
    return true
  }

  async disconnect() {
    // no-op
  }

  async print() {
    throw new Error('SystemDriver only supports printHTML()/printPDF() - raw ESC/POS bytes have no meaning to the OS print dialog')
  }

  async printHTML(html) {
    if (typeof document === 'undefined') throw new Error('printHTML() requires a browser environment')
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    return new Promise((resolve) => {
      iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        // Printing is synchronous-ish from the caller's perspective (the
        // dialog blocks), but browsers vary on firing afterprint reliably -
        // remove the iframe on a short delay rather than leaking it forever.
        setTimeout(() => document.body.removeChild(iframe), 2000)
        resolve(true)
      }
      iframe.srcdoc = html
    })
  }

  async printPDF(pdfBytes) {
    if (typeof window === 'undefined') throw new Error('printPDF() requires a browser environment')
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (!win) throw new Error('Pop-up blocked - allow pop-ups to print this PDF')
    win.addEventListener('load', () => win.print())
    return true
  }
}
