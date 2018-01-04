var objectValues = require('object-values')
var hypha = require('hypha')
var xtend = require('xtend')
var path = require('path')

module.exports = plugin

var defaults = {
  render: true
}

function plugin (contentDir, options) {
  options = xtend(defaults, options)
  contentDir = contentDir || '/content'

  return async function store (state, emitter, app) {
    options.archive = options.archive || createArchive()

    state.content = { }

    state.hypha = {
      error: '',
      loaded: false,
      isOwner: false,
      online: navigator.onLine,
      p2p: false
    }

    state.events.CONTENT_LOAD = 'content:load'
    state.events.CONTENT_LOADED = 'content:loaded'

    emitter.on(state.events.CONTENT_LOAD, contentLoad)
    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)

    async function contentLoad (data) {
      try {
        var info = await options.archive.getInfo()
        state.content = await loadContent(contentDir)
        state.hypha.isOwner = info.isOwner
        state.hypha.p2p = true
      } catch (err) {
        state.hypha.p2p = false
        state.hypha.error = err.message
        throw err
      }

      state.hypha.loaded = true
      emitter.emit(state.events.CONTENT_LOADED)
      if (options.render !== false) emitter.emit(state.events.RENDER)
    }

    function createArchive () {
      try {
        return new DatArchive(window.location.toString())
      } catch (err) {
        state.hypha.error = err.message
      }
    }

    async function loadContent (contentDir) {
      var opts = { fs: options.archive, parent: contentDir }
      var files = await options.archive.readdir(contentDir, { recursive: true })
      var glob = files.map(function (file) { return path.join(contentDir, file) }) // funny hack
      return hypha.readFiles(glob, contentDir, opts)
    }
  }
}
