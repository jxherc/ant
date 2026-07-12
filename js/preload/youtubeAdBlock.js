/* Extra first-party cleanup for YouTube ads that cannot be separated from
   normal video traffic by network filters alone. */

(function () {
  if (!process.isMainFrame || !(window.location.hostname === 'youtube.com' || window.location.hostname.endsWith('.youtube.com'))) {
    return
  }
  var youtubeBlockingEnabled = false
  var youtubeAdCleanupTimer = null
  var youtubeAdObserver = null
  var youtubeAdVideoState = null

  function restoreYouTubeVideo () {
    if (!youtubeAdVideoState) {
      return
    }
    if (youtubeAdVideoState.video.isConnected) {
      youtubeAdVideoState.video.muted = youtubeAdVideoState.muted
      youtubeAdVideoState.video.playbackRate = youtubeAdVideoState.playbackRate
    }
    youtubeAdVideoState = null
  }

  function removeYouTubePromotions () {
    document.querySelectorAll([
      'ytd-display-ad-renderer',
      'ytd-promoted-sparkles-web-renderer',
      'ytd-promoted-video-renderer',
      'ytd-ad-slot-renderer',
      'ytd-in-feed-ad-layout-renderer',
      '#player-ads',
      '#masthead-ad'
    ].join(',')).forEach(function (element) {
      element.remove()
    })
  }

  function skipYouTubeVideoAd () {
    var player = document.querySelector('.html5-video-player.ad-showing')
    if (!player) {
      restoreYouTubeVideo()
      return
    }

    var skipButton = player.querySelector([
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-overlay-close-button'
    ].join(','))
    if (skipButton) {
      skipButton.click()
      return
    }

    var video = player.querySelector('video')
    if (video) {
      if (!youtubeAdVideoState || youtubeAdVideoState.video !== video) {
        restoreYouTubeVideo()
        youtubeAdVideoState = {
          video: video,
          muted: video.muted,
          playbackRate: video.playbackRate
        }
      }
      video.muted = true
      video.playbackRate = 16
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(0, video.duration - 0.05)
      }
    }
  }

  function cleanYouTubeAds () {
    if (!youtubeBlockingEnabled) {
      return
    }
    removeYouTubePromotions()
    skipYouTubeVideoAd()
  }

  function setYouTubeBlocking (enabled) {
    youtubeBlockingEnabled = enabled
    clearInterval(youtubeAdCleanupTimer)
    if (youtubeAdObserver) {
      youtubeAdObserver.disconnect()
    }
    if (!enabled) {
      restoreYouTubeVideo()
      return
    }
    youtubeAdObserver = new MutationObserver(cleanYouTubeAds)
    youtubeAdObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    youtubeAdCleanupTimer = setInterval(cleanYouTubeAds, 500)
    cleanYouTubeAds()
  }

  ipc.on('content-blocking-state', function (event, enabled) {
    setYouTubeBlocking(enabled)
  })
  ipc.send('get-content-blocking-state', window.location.hostname)
}())
