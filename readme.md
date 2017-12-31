<h1 align="center">choo-dat-hypha (experimental)</h1>

A Choo plugin for reading a content directory with Hypha

```
npm i choo-dat-hypha
```

## Usage

Create a new Choo app and use the `choo-dat-hypha` plugin.

```js
var choo = require('choo')
var app = choo()

app.use(require('choo-dat-hypha')('/content'))

if (!module.parent) app.mount('body')
else module.exports = app
```

Format some plain text files using [smarkt](https://github.com/jondashkyle/smarkt) fields.

```
title: Technopastoral
----
date: January 19, 2038
----
tags:
  - garden
  - engineering
----
text: To deprogram oneself necessitates keeping to very specific schedules, which are what Foucault, once again, described as techniques of the self, echoing Seneca. 
```

Organize them within a directory structure alongside media assets.

```
/content
  /about
    index.txt
  /blog
    /38-01-19-technopastoral
      index.txt
      header.jpg
  index.txt
```

Now your content gets loaded into your Choo app’s state, and a route is created for each of your pages!

## Pattern

To easily access the data for each of your pages simply compare the `state.href` against your `state.content` object in a composable function.

```js
// wrapper.js
var xtend = require('xtend')

module.exports = wrapper

function wrapper (view) {
  return function (state, emit) {
    var page = state.content[state.href || '/'] || { }
    return view(xtend(state, { page: page }), emit)
  }
}
```

Now simply wrap your views!

```js
// view.js
var html = require('choo/html')
var wrapper = require('./wrapper')

module.exports = wrapper(view)

function view (state, emit) {
  return html`
    <body>
      The current page is ${state.page.title}
    </body
  `
}
```