import { Capacitor } from '@capacitor/core'

// Worldline (WEIPL / Paynimo) mandate checkout - the same checkout Fee
// Collection uses. The backend's /api/subscription/initiate returns the
// signed payload (token, txn_id, amounts, mandate dates) from the central
// subscription service; this only opens the checkout with it.
//
// The checkout's own success/failure answer is NOT trusted - callers must
// ask the backend to verify afterwards. This resolves with the raw outcome
// purely so the UI can tell "closed without paying" apart from "submitted".
const JQUERY_URL = 'https://www.paynimo.com/paynimocheckout/client/lib/jquery.min.js'
const CHECKOUT_URL = 'https://www.paynimo.com/paynimocheckout/server/lib/checkout.js'

function loadScript(src, isReady) {
  if (isReady()) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    const el = existing || document.createElement('script')
    el.addEventListener('load', () => resolve(), { once: true })
    el.addEventListener('error', () => reject(new Error('Could not load the payment window - check your connection')), { once: true })
    if (!existing) {
      el.src = src
      el.async = true
      document.head.appendChild(el)
    }
  })
}

const isNative = () => Capacitor.isNativePlatform() && typeof window.WLCheckout !== 'undefined'

function buildOptions(payload, native) {
  return {
    features: {
      enableAbortResponse: true,
      enableExpressPay: true,
      enableMerTxnDetails: true,
      siDetailsAtMerchantEnd: true,
      enableSI: true,
      enableInlineAutoDebit: true, // UPI AutoPay
    },
    consumerData: {
      deviceId: native ? 'ANDROIDSH2' : 'WEBSH2',
      token: payload.token,
      paymentMode: payload.paymentMode,
      merchantId: payload.merchantId,
      currency: 'INR',
      consumerId: payload.consumerId,
      consumerMobileNo: payload.customer?.mobilenumber,
      consumerEmailId: payload.customer?.email,
      txnId: payload.txn_id,
      items: [{ itemId: 'first', amount: payload.amount, comAmt: '0' }],
      customStyle: {
        PRIMARY_COLOR_CODE: '#7C3AED',
        SECONDARY_COLOR_CODE: '#FFFFFF',
        BUTTON_COLOR_CODE_1: '#7C3AED',
        BUTTON_COLOR_CODE_2: '#FFFFFF',
      },
      vpa: '',
      accountNo: '',
      ifscCode: '',
      accountType: '',
      debitStartDate: payload.debitStartDate,
      debitEndDate: payload.debitEndDate,
      maxAmount: payload.maxAmount || payload.amount,
      amountType: payload.amountType,
      frequency: payload.frequency,
      debitDay: payload.debitDay,
    },
  }
}

/** Reads Worldline's status code from a web or native response, if present. */
function statusCodeOf(res) {
  if (!res) return null
  if (res.paymentMethod?.paymentTransaction?.statusCode) return res.paymentMethod.paymentTransaction.statusCode
  if (typeof res.msg === 'string') return res.msg.split('|')[0] || null // native pipe-delimited result
  return null
}

export function useWorldlineCheckout() {
  /**
   * Opens the checkout and resolves when it closes:
   * { submitted: boolean, statusCode: string|null }
   */
  async function open(payload) {
    if (isNative()) {
      const options = buildOptions(payload, true)
      const res = await new Promise((resolve) => {
        window.WLCheckout.open(options, (r) => resolve(r), () => resolve(null))
      })
      const statusCode = statusCodeOf(res)
      return { submitted: Boolean(statusCode), statusCode }
    }

    await loadScript(JQUERY_URL, () => typeof window.$ !== 'undefined')
    await loadScript(CHECKOUT_URL, () => typeof window.$?.pnCheckout === 'function')
    if (typeof window.$?.pnCheckout !== 'function') throw new Error('The payment window is unavailable right now')

    return new Promise((resolve) => {
      const options = buildOptions(payload, false)
      options.consumerData.responseHandler = (res) => {
        const statusCode = statusCodeOf(res)
        resolve({ submitted: Boolean(statusCode), statusCode })
      }
      window.$.pnCheckout(options)
    })
  }

  return { open }
}
