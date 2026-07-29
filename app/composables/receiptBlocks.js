// Single source of truth for what block "type" strings the Receipt Designer
// offers and how each renders in the properties panel - MUST stay in sync
// with the switch statements in the backend's
// services/printing/escposRenderer.js and htmlRenderer.js, since a block
// type the Designer lets you add but neither renderer understands would
// silently print nothing.
export const BLOCK_META = {
  LOGO: { label: 'Logo', icon: 'mdi-image', category: 'Header', hasText: false, isImage: true },
  MERCHANT_INFO: { label: 'Merchant Info', icon: 'mdi-store', category: 'Header', hasText: false },
  ADDRESS: { label: 'Address', icon: 'mdi-map-marker', category: 'Header', hasText: false },
  GST: { label: 'GST Number', icon: 'mdi-file-document-outline', category: 'Header', hasText: false },
  INVOICE: { label: 'Invoice / Order #', icon: 'mdi-receipt', category: 'Order', hasText: false },
  DATE: { label: 'Date', icon: 'mdi-calendar', category: 'Order', hasText: false },
  CASHIER: { label: 'Cashier', icon: 'mdi-account-tie', category: 'Order', hasText: false },
  CUSTOMER: { label: 'Customer', icon: 'mdi-account', category: 'Order', hasText: false },
  ITEMS_TABLE: { label: 'Items Table', icon: 'mdi-table', category: 'Order', hasText: false },
  DISCOUNT: { label: 'Discount', icon: 'mdi-sale', category: 'Totals', hasText: false },
  COUPON: { label: 'Coupon', icon: 'mdi-ticket-percent', category: 'Totals', hasText: false, extraFields: ['code'] },
  TAX: { label: 'Tax (CGST/SGST/IGST)', icon: 'mdi-percent', category: 'Totals', hasText: false },
  SUBTOTAL: { label: 'Subtotal', icon: 'mdi-plus-minus', category: 'Totals', hasText: false },
  ROUND_OFF: { label: 'Round Off', icon: 'mdi-circle-half-full', category: 'Totals', hasText: false },
  GRAND_TOTAL: { label: 'Grand Total', icon: 'mdi-cash', category: 'Totals', hasText: false },
  PAYMENT: { label: 'Payment Method', icon: 'mdi-credit-card', category: 'Totals', hasText: false },
  QR: { label: 'QR Code', icon: 'mdi-qrcode', category: 'Media', hasText: false, extraFields: ['data'] },
  BARCODE: { label: 'Barcode', icon: 'mdi-barcode', category: 'Media', hasText: false, extraFields: ['data'] },
  TERMS: { label: 'Terms & Conditions', icon: 'mdi-file-document-edit-outline', category: 'Footer', hasText: true, supportsStyle: true },
  SIGNATURE: { label: 'Signature', icon: 'mdi-draw-pen', category: 'Footer', hasText: false, extraFields: ['label'] },
  FOOTER: { label: 'Footer Message', icon: 'mdi-text', category: 'Footer', hasText: true, supportsStyle: true },
  TEXT: { label: 'Custom Text', icon: 'mdi-format-text', category: 'Layout', hasText: true, supportsStyle: true },
  DIVIDER: { label: 'Divider Line', icon: 'mdi-minus', category: 'Layout', hasText: false, extraFields: ['char'] },
  SPACER: { label: 'Spacer', icon: 'mdi-arrow-expand-vertical', category: 'Layout', hasText: false, extraFields: ['lines'] },
}

export const BLOCK_TYPES = Object.keys(BLOCK_META)

export const BLOCK_CATEGORIES = ['Header', 'Order', 'Totals', 'Media', 'Footer', 'Layout']

export function defaultPropsFor(type) {
  switch (type) {
    case 'QR':
      return { data: 'Order:{{order.id}}' }
    case 'BARCODE':
      return { data: '{{order.id}}' }
    case 'FOOTER':
      return { text: 'Thank you, visit again!' }
    case 'TERMS':
      return { text: 'No refunds after 24 hours' }
    case 'DIVIDER':
      return { char: '-' }
    case 'SPACER':
      return { lines: 1 }
    case 'SIGNATURE':
      return { label: 'Authorized Signatory' }
    default:
      return {}
  }
}

export function newBlock(type) {
  return {
    id: `${type.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type,
    props: defaultPropsFor(type),
  }
}
