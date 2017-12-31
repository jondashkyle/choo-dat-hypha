<h1 align="center">choo-dat-hypha (experimental)</h1>

A Choo plugin for reading a content directory with Hypha

## Usage

```
var choo = require('choo')
var app = choo()

app.use(require('choo-dat-hypha')('./content'))

if (!module.parent) app.mount('body')
else module.exports = app
```

- Loads your content directory into state
- Each sub-directory becomes a route