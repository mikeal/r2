# r2

<p>
  <a href="https://www.patreon.com/bePatron?u=880479">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" height="40px" />
  </a>
</p>

Early in Node.js I wrote an HTTP client library called `request`. It evolved
along with Node.js and eventually became very widely depended upon.

A lot has changed since 2010 and I've decided to re-think what a simple
HTTP client library should look like.

This new library, `r2`, is a completely new approach from request.

* Rather than being built on top of the Node.js Core HTTP library and
  shimmed for the Browser, `r2` is built on top of the browser's
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

Being written to the Fetch API is a huge benefit for browser users.

When running through browserify `request` is ~2M uncompressed and ~500K compressed. `r2` is only 66K uncompressed and 16K compressed.


## Installation

:warning: An NPM package `r2` exists but does not yet refer to this project (see [#20](https://github.com/mikeal/r2/issues/20)). In the meantime install like this:

```
# via HTTPS
npm install git+https://git@github.com:mikeal/r2.git --save

# via SSH
npm install git+ssh://git@github.com:mikeal/r2.git --save
```
