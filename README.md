# r2

Early in Node.js I wrote an HTTP client library called `request`. It evolved
along with Node.js and eventually became very widely depended upon.

A lot has changed since 2010 and I've decided to re-think what a simple
HTTP client library should look like.

This new library, `r2`, is a completely new approach from request.

* Rather than being built on top of the Node.js Core HTTP library and
  shimed for the Browser, `r2` is built on top of the browser's
  Fetch API and shimmed for Node.js.
* APIs are meant to be used with async await, which means they are
  based on promises.

```javascript
const r2 = require('r2')

let html = await r2('https://www.google.com').text
```

Simple JSON support.

```javascript
let obj = {ok: true}

let resp = await r2.put('http://localhost/test.json', {json: obj}).json
```

Simple headers support.

```javascript
let headers = {'x-test': 'ok'}

let res = await r2('http://localhost/test', {headers}).response
```
