/* Browser-wide cosmetic ad cleanup. Network requests are handled by EasyList
   in the main process; this layer removes first-party and inline ad containers. */

(function () {
  if (!process.isMainFrame) {
    return
  }

  var cosmeticBlockingEnabled = false
  var cosmeticStyle = null
  var cleanupObserver = null
  var cleanupScheduled = false
  var waitingForDocument = false

  const genericAdSelectors = [
    'ins.adsbygoogle',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    '[id^="google_ads_iframe"]',
    '[data-ad-client][data-ad-slot]',
    '[aria-label="Advertisement"]',
    '[aria-label="Sponsored content"]',
    '[data-ant-ad-hidden]',
    'embed[src*="advertising"][src*="banner"]',
    'object[data*="advertising"][data*="banner"]',
    'img[src*="advertising"][src*="banner"]',
    '[src*="/banners/"][src*="_ads_"]'
  ]

  const siteAdSelectors = {
    'x.com': [
      'article:has(a[href*="/i/adsct"])',
      'div[data-testid="cellInnerDiv"] > div > div[class] > div[class][data-testid="placementTracking"]',
      'div[data-testid="placementTracking"]:has(div[data-testid$="-impression-pixel"])',
      'div[data-testid="trend"]:has(a[href*="src=promoted_trend_click"])'
    ],
    'twitter.com': [
      'article:has(a[href*="/i/adsct"])',
      'div[data-testid="cellInnerDiv"] > div > div[class] > div[class][data-testid="placementTracking"]',
      'div[data-testid="placementTracking"]:has(div[data-testid$="-impression-pixel"])',
      'div[data-testid="trend"]:has(a[href*="src=promoted_trend_click"])'
    ],
    'reddit.com': [
      'shreddit-post[promoted]',
      '.promotedlink',
      '[data-promoted="true"]'
    ]
  }

  function hostnameMatches (hostname, domain) {
    return hostname === domain || hostname.endsWith('.' + domain)
  }

  function getCosmeticSelectors () {
    var selectors = genericAdSelectors.slice()
    Object.keys(siteAdSelectors).forEach(function (domain) {
      if (hostnameMatches(window.location.hostname, domain)) {
        selectors = selectors.concat(siteAdSelectors[domain])
      }
    })
    return selectors
  }

  function installCosmeticStyles () {
    if (cosmeticStyle) {
      cosmeticStyle.remove()
    }
    cosmeticStyle = document.createElement('style')
    cosmeticStyle.id = 'ant-cosmetic-ad-blocking'
    cosmeticStyle.textContent = getCosmeticSelectors().join(',') + '{display:none !important;visibility:hidden !important}'
    var styleParent = document.head || document.documentElement
    styleParent.appendChild(cosmeticStyle)
  }

  function hasSponsoredLabel (container) {
    const labels = container.querySelectorAll('span, [role="link"], [dir="auto"]')
    // Keep this anchored so normal posts discussing advertising are not hidden.
    // X currently uses both "Promoted" and "Promoted Post".
    const sponsoredLabel = /^(ad|advertisement|promoted(?: post)?|sponsored(?: post| content)?|gesponsert|sponsorisé|sponsorisée|patrocinado|publicidad|promocionado|promoted by .+)$/i
    return Array.from(labels).some(function (label) {
      return sponsoredLabel.test((label.textContent || '').trim())
    })
  }

  function hideAdContainer (element) {
    if (!element) {
      return
    }
    const container = element.closest('article') || element.closest('[data-testid="cellInnerDiv"]') || element
    container.setAttribute('data-ant-ad-hidden', '')
  }

  function removeXAds () {
    // placementTracking is X's strongest current ad marker. Hide its complete
    // feed cell, rather than only the inner payload, to avoid empty ad gaps.
    document.querySelectorAll('[data-testid="placementTracking"]').forEach(hideAdContainer)

    document.querySelectorAll('a[href*="/i/adsct"], a[href*="src=promoted_trend_click"]').forEach(hideAdContainer)

    document.querySelectorAll('article, [data-testid="cellInnerDiv"], [data-testid="trend"], [data-testid="UserCell"]').forEach(function (item) {
      if (hasSponsoredLabel(item)) {
        hideAdContainer(item)
      }
    })
  }

  function removeSocialAds () {
    const hostname = window.location.hostname

    if (hostnameMatches(hostname, 'x.com') || hostnameMatches(hostname, 'twitter.com')) {
      removeXAds()
    }

    if (hostnameMatches(hostname, 'instagram.com')) {
      document.querySelectorAll('article').forEach(function (item) {
        if (hasSponsoredLabel(item)) {
          item.remove()
        }
      })
    }

    if (hostnameMatches(hostname, 'facebook.com')) {
      document.querySelectorAll('[role="article"]').forEach(function (item) {
        if (hasSponsoredLabel(item)) {
          item.remove()
        }
      })
    }
  }

  function scheduleCleanup () {
    if (!cosmeticBlockingEnabled || cleanupScheduled) {
      return
    }
    cleanupScheduled = true
    window.requestAnimationFrame(function () {
      cleanupScheduled = false
      removeSocialAds()
    })
  }

  function setCosmeticBlocking (enabled) {
    cosmeticBlockingEnabled = enabled

    if (cleanupObserver) {
      cleanupObserver.disconnect()
      cleanupObserver = null
    }
    if (cosmeticStyle) {
      cosmeticStyle.remove()
      cosmeticStyle = null
    }
    if (!enabled) {
      return
    }

    if (!document.documentElement) {
      if (!waitingForDocument) {
        waitingForDocument = true
        window.addEventListener('DOMContentLoaded', function () {
          waitingForDocument = false
          setCosmeticBlocking(cosmeticBlockingEnabled)
        }, { once: true })
      }
      return
    }

    installCosmeticStyles()
    cleanupObserver = new MutationObserver(scheduleCleanup)
    cleanupObserver.observe(document.documentElement, { childList: true, subtree: true })
    scheduleCleanup()
  }

  ipc.on('content-blocking-state', function (event, enabled) {
    setCosmeticBlocking(enabled)
  })
  ipc.send('get-content-blocking-state', window.location.hostname)
}())
