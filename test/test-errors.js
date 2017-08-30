const r2 = require('../')
const http = require('http')
const test = require('tap').test
const promisify = require('util').promisify

let createServer = handler => {
  let server = http.createServer(handler)
  server._close = server.close
  server.close = promisify(cb => server._close(cb))
  server._listen = server.listen
  server.listen = promisify((port, cb) => server._listen(port, cb))
  return server
}

test('cannot connect', async t => {
  t.plan(2)
  let msg = 'request to http://localhost:1234/ failed, reason: connect ECONNREFUSED 127.0.0.1:1234'
  try {
    await r2('http://localhost:1234').response
  } catch (e) {
    t.type(e, 'Error')
    t.same(e.message, msg)
  }
})

test('set read-only property', async t => {
  t.plan(2)
  let msg = 'Cannot set read-only property.'
  let server = createServer((req, res) => {
    res.end()
  })
  await server.listen(1123)
  let r
  try {
    r = r2('http://localhost:1123/test')
    r.json = 'asdf'
  } catch (e) {
    t.type(e, 'Error')
    t.same(e.message, msg)
  }
  await r.text
  await server.close()
})
