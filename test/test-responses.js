const r2 = require('../')
const test = require('tap').test
const http = require('http')
const promisify = require('util').promisify

let createServer = handler => {
  let server = http.createServer(handler)
  server._close = server.close
  server.close = promisify(cb => server._close(cb))
  server._listen = server.listen
  server.listen = promisify((port, cb) => server._listen(port, cb))
  return server
}

let url = 'http://localhost:1123/test'

test('arraybuffer', async t => {
  t.plan(2)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    res.end('test')
  })
  await server.listen(1123)
  t.same(Buffer.from(await r2(url).arrayBuffer), Buffer.from('test'))
  await server.close()
})

test('blob', async t => {
  t.plan(2)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    res.end('test')
  })
  await server.listen(1123)
  let blob = await r2(url).blob
  t.same(blob.size, 4)
  await server.close()
})
