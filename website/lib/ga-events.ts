'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function trackPageView(pagePath: string) {
  sendGAEvent('event', 'page_view', {
    page_path: pagePath,
  })
}

export function trackRegisterConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: 'AW-17369711139/prEvCKzZlegbEKOEw9pA',
    value: 1.0,
    currency: 'USD',
  })
}

export function trackLoginConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: 'AW-17369711139/qDrkCP2wlugbEKOEw9pA',
  })
}

export function trackOAuthLoginConversions(oauthSource: string | null) {
  if (oauthSource === 'register') {
    trackRegisterConversion()
  }
  trackLoginConversion()
}

export function trackTokenCreateConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: 'AW-17369711139/XzsNCLaMmegbEKOEw9pA',
    value: 1.0,
    currency: 'USD',
  })
}

export function trackTopupStartConversion() {
  sendGAEvent('event', 'conversion', {
    send_to: 'AW-17369711139/XsEZCJSPlugbEKOEw9pA',
    value: 1.0,
    currency: 'USD',
  })
}

export function trackTopupSuccessConversion(amount: number, transactionId: string) {
  sendGAEvent('event', 'conversion', {
    send_to: 'AW-17369711139/WmDvCO3Rwt8bEKOEw9pA',
    value: amount,
    currency: 'USD',
    transaction_id: transactionId,
  })
}
