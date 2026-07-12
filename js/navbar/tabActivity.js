/* fades out tabs that are inactive */

var tabBar = require('navbar/tabBar.js')
var webviews = require('webviews.js')

var tabActivity = {
  minFadeAge: 330000,
  discardAge: 30 * 60 * 1000,
  maxWarmBackgroundTabs: 6,
  discardInactiveTabs: function (time) {
    const candidates = []

    tasks.forEach(function (task) {
      task.tabs.get().forEach(function (tab) {
        if (tab.id !== webviews.selectedId && tab.hasWebContents && !tab.hasAudio) {
          candidates.push(tab)
        }
      })
    })

    candidates
      .sort(function (a, b) { return b.lastActivity - a.lastActivity })
      .slice(tabActivity.maxWarmBackgroundTabs)
      .filter(function (tab) { return time - tab.lastActivity > tabActivity.discardAge })
      .forEach(function (tab) {
        webviews.destroy(tab.id)
      })
  },
  refresh: function () {
    requestAnimationFrame(function () {
      var tabSet = tabs.get()
      var selected = tabs.getSelected()
      var time = Date.now()

      tabSet.forEach(function (tab) {
        if (selected === tab.id) { // never fade the current tab
          tabBar.getTab(tab.id).classList.remove('fade')
          return
        }
        if (time - tab.lastActivity > tabActivity.minFadeAge) { // the tab has been inactive for greater than minActivity, and it is not currently selected
          tabBar.getTab(tab.id).classList.add('fade')
        } else {
          tabBar.getTab(tab.id).classList.remove('fade')
        }
      })

      tabActivity.discardInactiveTabs(time)
    })
  },
  initialize: function () {
    setInterval(tabActivity.refresh, 7500)

    tasks.on('tab-selected', this.refresh)
  }
}

module.exports = tabActivity
