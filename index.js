/* globals fetch, Headers */
/* istanbul ignore next */
const fetch = process.browser ? fetch : require('node-fetch')
const headers = process.browser ? fetch.Headers : Headers

const caseless = require('caseless')
const toTypedArray = require('typedarray-to-buffer')

const makeHeaders = obj => {
  let h = new Headers()
  for (let key in obj) {
    h.append(key, obj[key])
  }
  return h
}

const makeBody = value => {
  // TODO: Streams support.
  if (typeof value === 'string') {
    value = Buffer.from(value)
  }
  /* Can't test Blob types in Node.js */
  /* istanbul ignore else */
  if (Buffer.isBuffer(value)) {
    value = toTypedArray(value)
  }
  return value
}

const resolvable = () => {
  let _resolve
  let _reject
  let p = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
  p.resolve = (...args) => _resolve(...args)
  p.reject = (...args) => _reject(...args)
  return p
}

class R2 {
  constructor (...args) {
    this.opts = {method: 'GET'}
    this.response = resolvable()
    this._headers = {}
    this._caseless = caseless(this._headers)

    let failSet = () => { throw new Error('Cannot set read-only property.') }
    Object.defineProperty(this, 'json', {
      get: () => this.response.then(resp => resp.clone().json()),
      set: failSet
    })
    Object.defineProperty(this, 'text', {
      get: () => this.response.then(resp => resp.clone().text()),
      set: failSet
    })
    Object.defineProperty(this, 'arrayBuffer', {
      get: () => this.response.then(resp => resp.clone().arrayBuffer()),
      set: failSet
    })
    Object.defineProperty(this, 'blob', {
      get: () => this.response.then(resp => resp.clone().blob()),
      set: failSet
    })
    Object.defineProperty(this, 'formData', {
      /* This isn't implemented in the shim yet */
      get: /* istanbul ignore next */
        () => this.response.then(resp => resp.clone().formData()),
      set: failSet
    })

    this._args(...args)

    setTimeout(() => {
      this._request()
    }, 0)
  }
  _args (...args) {
    let opts = this.opts
    if (typeof args[0] === 'string') {
      opts.url = args.shift()
    }
    if (typeof args[0] === 'object') {
      opts = Object.assign(opts, args.shift())
    }
    if (opts.headers) this.setHeaders(opts.headers)
    this.opts = opts
  }
  _request () {
    let url = this.opts.url
    delete this.opts.url

    if (this.opts.json) {
      this.opts.body = JSON.stringify(this.opts.json)
      this.setHeader('content-type', 'application/json')
      delete this.opts.json
    }

    if (this.opts.body) {
      this.opts.body = makeBody(this.opts.body)
    }

    // TODO: formData API.

    this.opts.headers = makeHeaders(this._headers)

    fetch(url, this.opts)
    .then(resp => this.response.resolve(resp))
    .catch(err => this.response.reject(err))
  }
  setHeaders (obj) {
    for (let key in obj) {
      this._caseless.set(key, obj[key])
    }
    return this
  }
  setHeader (key, value) {
    let o = {}
    o[key] = value
    return this.setHeaders(o)
  }
}

module.exports = (...args) => new R2(...args)
const methods = ['get', 'put', 'post', 'head', 'patch', 'delete']
for (const method of methods) {
  R2.prototype[method] = function(...args) {
    this.opts.method = method.toUpperCase();
    this._args(...args)
    return this
  }
  module.exports[method] = (...args) => new R2()[method](...args)
}
