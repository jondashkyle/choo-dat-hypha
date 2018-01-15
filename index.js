var objectValues = require('object-values')
var assert = require('assert')
var hypha = require('hypha')
var xtend = require('xtend')
var path = require('path')

module.exports = plugin

var defaults = {
  parent: '/content',
  render: true
}

function plugin (parent, options) {
  assert(typeof parent !== 'undefined', 'Please provide a directory string or options object')
  if (typeof parent === 'object') { options = parent }
  options = xtend(defaults, options)
  if (typeof parent === 'string') { options.parent = parent }
  assert(typeof options.parent === 'string', 'Please provide a content directory')
  options.url = options.url || window.location.toString()

  return async function store (state, emitter, app) {
    state.content = { }

    state.hypha = {
      error: '',
      loaded: false,
      isOwner: false,
      online: navigator.onLine,
      p2p: false,
      url: options.url
    }

    options.archive = options.archive || createArchive()

    state.events.CONTENT_LOAD = 'content:load'
    state.events.CONTENT_LOADED = 'content:loaded'

    emitter.on(state.events.CONTENT_LOAD, contentLoad)
    emitter.on(state.events.DOMCONTENTLOADED, contentLoad)

    async function contentLoad (data) {
      try {
        var info = await options.archive.getInfo()
        state.content = await loadContent(options.parent)
        state.hypha.isOwner = info.isOwner
        state.hypha.p2p = true
      } catch (err) {
        state.hypha.p2p = false
        state.hypha.error = err.message
      }

      state.hypha.loaded = true
      emitter.emit(state.events.CONTENT_LOADED)
      if (options.render !== false) emitter.emit(state.events.RENDER)
    }

    function createArchive () {
      try {
        return new DatArchive(options.url)
      } catch (err) {
        state.hypha.error = err.message
      }
    }

    async function loadContent (parent) {
      var opts = { fs: options.archive, parent: parent }
      var files = await options.archive.readdir(parent, { recursive: true })
      var glob = files.map(function (file) { return path.join(parent, file) })
      return hypha.readFiles(glob, parent, opts)
    }
  }
}
