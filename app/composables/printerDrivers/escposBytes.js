// Tiny shared ESC/POS byte snippets for the standalone cut()/feed()/beep()/
// openDrawer() driver methods (out-of-band control, not part of a full
// receipt buffer). The full receipt itself is always rendered server-side
// (services/printing/escposCommands.js in the backend) - drivers here only
// ever transport bytes they're given, plus these few fixed snippets.
const ESC = 0x1b
const GS = 0x1d

export function cutBytes() {
    return new Uint8Array([ESC, 0x64, 3, GS, 0x56, 1]) // feed 3 lines, partial cut
}

export function feedBytes(lines = 1) {
    return new Uint8Array([ESC, 0x64, lines])
}

export function beepBytes(times = 1, duration = 3) {
    return new Uint8Array([0x1b, 0x42, times, duration])
}

export function openDrawerBytes() {
    return new Uint8Array([ESC, 0x70, 0, 25, 250])
}

export function testPrintBytes(printerName) {
    const text = `TEST PRINT\n${printerName || ''}\n${new Date().toLocaleString()}\n\n\n`
    return new Uint8Array([ESC, 0x40, ...new TextEncoder().encode(text), ...cutBytes()])
}
