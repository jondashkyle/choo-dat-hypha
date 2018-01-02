var objectValues = require('object-values')
var hypha = require('hypha')
var path = require('path')

module.exports = plugin

function plugin (contentDir, archive) {
  archive = archive || createArchive()
  contentDir = contentDir || '/content'

  return async function store (state, emitter, app) {
    state.content = { }

    state.hypha = {
      error: '',
      loaded: false,
      isOwner: false,
      p2p: false
    }

    state.events.CONTENT_LOAD = 'content:load'
    emitter.on(state.events.CONTENT_LOAD, contentLoad)
    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)

    async function contentLoad (data) {
      try {
        state.content = await loadContent(contentDir)
        state.hypha.loaded = true
      } catch (err) {
        state.hypha.error = err.message
      }

      emitter.emit(state.events.RENDER)
    }
  }

  function createArchive () {
    try {
      return new DatArchive(window.location.toString())
      state.hypha.p2p = true
    } catch (err) {
      state.hypha.p2p = false
      state.hypha.error = err.message
    }
  }

  async function loadContent (contentDir) {
    var options = { fs: archive, parent: contentDir }
    var files = await archive.readdir(contentDir, { recursive: true })
    var glob = files.map(function (file) { return path.join(contentDir, file) }) // funny hack
    return hypha.readFiles(glob, contentDir, options)
  }
}
