var objectValues = require('object-values')
var hypha = require('hypha')
var path = require('path')

module.exports = plugin

function plugin (contentDir) {
  contentDir = contentDir || '/content'
  return async function store (state, emitter, app) {
    state.content = { }
    state.loaded = false

    state.events.CONTENT_LOAD = 'content:load'
    emitter.on(state.events.CONTENT_LOAD, contentLoad)
    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)

    async function contentLoad (data) {
      try {
        state.content = await loadContent(contentDir)
        state.p2p = true
      } catch (err) {
        state.p2p = false
      }
      state.loaded = true
      emitter.emit(state.events.RENDER)
    }
  }
}

async function loadContent (contentDir) {
  var archive = new DatArchive(window.location.toString())
  var options = { fs: archive, parent: contentDir }
  var files = await archive.readdir(contentDir, { recursive: true })
  var glob = files.map(function (file) { return path.join(contentDir, file) }) // funny hack
  return hypha.readFiles(glob, contentDir, options)
}
