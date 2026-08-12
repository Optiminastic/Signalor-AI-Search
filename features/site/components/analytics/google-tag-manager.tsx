'use client'

import Script from 'next/script'

const GTM_ID = 'GTM-TQ7NBN8Q'

/**
 * Google Tag Manager loader. Mirrors the standard GTM snippet: the container
 * script mounts after hydration and the <noscript> iframe is the fallback for
 * JS-disabled clients. GTM itself governs downstream tag firing (incl. consent
 * mode), so this loads on every page like the previous frontend did.
 */
export function GoogleTagManager() {
  return (
    <Script id="gtm-loader" strategy="lazyOnload">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  )
}

/** The <noscript> GTM fallback. Render as the first child of <body>. */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        title="gtm"
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
