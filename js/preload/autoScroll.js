/* Chromium-style middle-click autoscroll for pages that do not implement it. */

(function () {
  if (!process.isMainFrame) {
    return
  }
  var autoScrollState = null
  var autoScrollFrame = null

  function findScrollableElement (start) {
    var element = start
    while (element && element !== document.documentElement) {
      var style = window.getComputedStyle(element)
      var canScrollY = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight
      var canScrollX = /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth
      if (canScrollX || canScrollY) {
        return element
      }
      element = element.parentElement
    }
    return document.scrollingElement || document.documentElement
  }

  function stopAutoScroll () {
    if (!autoScrollState) {
      return
    }
    cancelAnimationFrame(autoScrollFrame)
    autoScrollState.marker.remove()
    autoScrollState = null
    autoScrollFrame = null
  }

  function getScrollVelocity (distance) {
    var deadZone = 12
    if (Math.abs(distance) <= deadZone) {
      return 0
    }
    var direction = distance < 0 ? -1 : 1
    return direction * Math.min(42, Math.pow((Math.abs(distance) - deadZone) / 10, 1.35))
  }

  function runAutoScroll () {
    if (!autoScrollState) {
      return
    }
    var x = getScrollVelocity(autoScrollState.pointerX - autoScrollState.originX)
    var y = getScrollVelocity(autoScrollState.pointerY - autoScrollState.originY)
    autoScrollState.scrollTarget.scrollBy(x, y)
    autoScrollFrame = requestAnimationFrame(runAutoScroll)
  }

  window.addEventListener('mousedown', function (event) {
    if (event.button !== 1) {
      return
    }

    // Keep the browser's normal "open in background tab" behavior for links.
    if (event.target.closest && event.target.closest('a[href], area[href]')) {
      return
    }

    event.preventDefault()
    stopAutoScroll()

    var marker = document.createElement('div')
    marker.setAttribute('aria-hidden', 'true')
    marker.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'width:28px',
      'height:28px',
      'margin:-14px 0 0 -14px',
      'left:' + event.clientX + 'px',
      'top:' + event.clientY + 'px',
      'border-radius:50%',
      'background:rgba(10,10,10,.88)',
      'box-shadow:0 2px 12px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.22)',
      'pointer-events:none'
    ].join(';')
    marker.innerHTML = '<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><path fill="white" d="M14 4l4 5h-3v4h-2V9h-3l4-5zm0 20l-4-5h3v-4h2v4h3l-4 5z"/></svg>'
    document.documentElement.appendChild(marker)

    autoScrollState = {
      originX: event.clientX,
      originY: event.clientY,
      pointerX: event.clientX,
      pointerY: event.clientY,
      marker: marker,
      scrollTarget: findScrollableElement(event.target)
    }
    autoScrollFrame = requestAnimationFrame(runAutoScroll)
  }, true)

  window.addEventListener('mousemove', function (event) {
    if (autoScrollState) {
      autoScrollState.pointerX = event.clientX
      autoScrollState.pointerY = event.clientY
    }
  }, true)

  window.addEventListener('mousedown', function (event) {
    if (autoScrollState && event.button !== 1) {
      stopAutoScroll()
    }
  }, true)

  window.addEventListener('keydown', function (event) {
    if (autoScrollState && event.key === 'Escape') {
      stopAutoScroll()
    }
  }, true)

  window.addEventListener('blur', stopAutoScroll)
  window.addEventListener('beforeunload', stopAutoScroll)
}())
