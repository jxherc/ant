var webviews = require('webviews.js')

var webviewMinZoom = 0.5
var webviewMaxZoom = 3.0

var webviewGestures = {
  zoomWebviewBy: function (tabId, amount) {
    webviews.callAsync(tabId, 'zoomFactor', function (err, oldFactor) {
      if (!err) {
        webviews.callAsync(tabId, 'zoomFactor', Math.min(webviewMaxZoom, Math.max(webviewMinZoom, oldFactor + amount)))
      }
    })
  },
  zoomWebviewIn: function (tabId) {
    return this.zoomWebviewBy(tabId, 0.2)
  },
  zoomWebviewOut: function (tabId) {
    return this.zoomWebviewBy(tabId, -0.2)
  },
  resetWebviewZoom: function (tabId) {
    webviews.callAsync(tabId, 'zoomFactor', 1.0)
  }
}

var swipeGestureDistanceResetTimeout = -1
var swipeGestureScrollResetTimeout = -1
var swipeGestureLowVelocityTimeout = -1
var swipeGestureDelay = 100
var swipeGestureScrollDelay = 750
var swipeGestureVelocityDelay = 70

var horizontalMouseMove = 0
var verticalMouseMove = 0
var leftMouseMove = 0
var rightMouseMove = 0

var beginningScrollLeft = null
var beginningScrollRight = null
var isInFrame = false

var initialZoomKeyState = null
var initialSecondaryKeyState = null

function resetDistanceCounters () {
  horizontalMouseMove = 0
  verticalMouseMove = 0
  leftMouseMove = 0
  rightMouseMove = 0
  initialZoomKeyState = null
  initialSecondaryKeyState = null
}

function resetScrollCounters () {
  beginningScrollLeft = null
  beginningScrollRight = null
  isInFrame = false
}

function onSwipeGestureLowVelocity () {
  // Scroll position cannot be inspected inside an iframe, so navigation is
  // intentionally disabled for gestures that begin in one.
  if (isInFrame) {
    return
  }

  webviews.callAsync(tabs.getSelected(), 'getZoomFactor', function (err, result) {
    if (err) {
      return
    }

    const minScrollDistance = 150 * result
    const isHorizontal = Math.abs(horizontalMouseMove / verticalMouseMove) > 3
    const hasSingleDirection = (leftMouseMove / rightMouseMove > 5) || (rightMouseMove / leftMouseMove > 5)

    if (!hasSingleDirection || !isHorizontal) {
      return
    }

    // Min's direction mapping: swipe left to go forward.
    if (leftMouseMove - beginningScrollRight > minScrollDistance && beginningScrollRight < 5) {
      resetDistanceCounters()
      resetScrollCounters()
      webviews.callAsync(tabs.getSelected(), 'goForward')
      return
    }

    // Swipe right to go back.
    if (rightMouseMove + beginningScrollLeft > minScrollDistance && beginningScrollLeft < 5) {
      resetDistanceCounters()
      resetScrollCounters()
      webviews.goBackIgnoringRedirects(tabs.getSelected())
    }
  })
}

webviews.bindIPC('wheel-event', function (tabId, serializedEvent) {
  var event = JSON.parse(serializedEvent)

  if (event.defaultPrevented) {
    return
  }

  verticalMouseMove += event.deltaY
  horizontalMouseMove += event.deltaX
  if (event.deltaX > 0) {
    leftMouseMove += event.deltaX
  } else {
    rightMouseMove += event.deltaX * -1
  }

  var platformZoomKey = navigator.platform === 'MacIntel' ? event.metaKey : event.ctrlKey
  var platformSecondaryKey = navigator.platform === 'MacIntel' ? event.ctrlKey : false

  if (beginningScrollLeft === null || beginningScrollRight === null) {
    webviews.callAsync(tabId, 'executeJavaScript', `
      (function () {
        var left = 0
        var right = 0
        var isInFrame = false
        var node = document.elementFromPoint(${event.clientX}, ${event.clientY})
        while (node) {
          if (node.tagName === 'IFRAME') {
            isInFrame = true
          }
          if (node.scrollLeft !== undefined) {
            left = Math.max(left, node.scrollLeft)
            right = Math.max(right, node.scrollWidth - node.clientWidth - node.scrollLeft)
          }
          node = node.parentElement
        }
        return { left, right, isInFrame }
      })()
    `, function (err, result) {
      if (err) {
        return
      }
      if (beginningScrollLeft === null || beginningScrollRight === null) {
        beginningScrollLeft = result.left
        beginningScrollRight = result.right
      }
      isInFrame = isInFrame || result.isInFrame
    })
  }

  if (initialZoomKeyState === null) {
    initialZoomKeyState = platformZoomKey
  }
  if (initialSecondaryKeyState === null) {
    initialSecondaryKeyState = platformSecondaryKey
  }

  if (Math.abs(event.deltaX) >= 20 || Math.abs(event.deltaY) >= 20) {
    clearTimeout(swipeGestureLowVelocityTimeout)
    swipeGestureLowVelocityTimeout = setTimeout(onSwipeGestureLowVelocity, swipeGestureVelocityDelay)
  }

  clearTimeout(swipeGestureDistanceResetTimeout)
  clearTimeout(swipeGestureScrollResetTimeout)
  swipeGestureDistanceResetTimeout = setTimeout(resetDistanceCounters, swipeGestureDelay)
  swipeGestureScrollResetTimeout = setTimeout(resetScrollCounters, swipeGestureScrollDelay)

  if (platformZoomKey && initialZoomKeyState) {
    if (verticalMouseMove > 50) {
      verticalMouseMove = -10
      webviewGestures.zoomWebviewOut(tabId)
    }
    if (verticalMouseMove < -50) {
      verticalMouseMove = -10
      webviewGestures.zoomWebviewIn(tabId)
    }
  }
})

module.exports = webviewGestures
