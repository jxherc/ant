class InitialLoadQueue {
  constructor (startLoad, timeout = 10000) {
    this.startLoad = startLoad
    this.timeout = timeout
    this.pending = []
    this.active = null
    this.activeTimeout = null
  }

  enqueue (id, url) {
    const item = { id, url }
    if (!this.active) {
      this.startNext(item)
    } else {
      this.pending.push(item)
    }
  }

  prioritize (id) {
    const index = this.pending.findIndex(item => item.id === id)
    if (index === -1) {
      return false
    }
    const item = this.pending.splice(index, 1)[0]
    this.startLoad(item.id, item.url)
    return true
  }

  complete (id) {
    if (!this.active || this.active.id !== id) {
      return
    }
    clearTimeout(this.activeTimeout)
    this.activeTimeout = null
    this.active = null
    this.startNext()
  }

  remove (id) {
    this.pending = this.pending.filter(item => item.id !== id)
    if (this.active && this.active.id === id) {
      this.complete(id)
    }
  }

  startNext (item = this.pending.shift()) {
    if (!item) {
      return
    }
    this.active = item
    this.startLoad(item.id, item.url)
    this.activeTimeout = setTimeout(() => this.complete(item.id), this.timeout)
  }
}

module.exports = InitialLoadQueue
