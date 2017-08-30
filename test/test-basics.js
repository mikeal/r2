const r2 = require('../')
const test = require('tap').test
const http = require('http')
const promisify = require('util').promisify
const body = promisify(require('body'))

let createServer = handler => {
  let server = http.createServer(handler)
  server._close = server.close
  server.close = promisify(cb => server._close(cb))
  server._listen = server.listen
  server.listen = promisify((port, cb) => server._listen(port, cb))
  return server
}

let url = 'http://localhost:1123/test'

test('basic get', async t => {
  t.plan(2)
  let server = createServer((req, res) => {
    t.same(req.url, '/test')
    res.end('ok')
  })
  await server.listen(1123)
  t.same(await r2(url).text, 'ok')
  await server.close()
})

test('basic put', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(await body(req), 'test')
    res.end('ok')
  })
  await server.listen(1123)
  t.same(await r2.put(url, {body: 'test'}).text, 'ok')
  await server.close()
})

test('json put and get', async t => {
  t.plan(4)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.headers['content-type'], 'application/json')
    t.same(await body(req), '{"t":"test"}')
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ok: true}))
  })
  await server.listen(1123)
  t.same(await r2.put(url, {json: {t: 'test'}}).json, {ok: true})
  await server.close()
})

test('headers', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.headers['x-test'], 'blah')
    res.end('test')
  })
  await server.listen(1123)
  t.same(await r2.get(url, {headers: {'x-test': 'blah'}}).text, 'test')
  await server.close()
})

test('post', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.method, 'POST')
    res.end('test')
  })
  await server.listen(1123)
  t.same(await r2.post(url).text, 'test')
  await server.close()
})

test('head', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.method, 'HEAD')
    res.end('test')
  })
  await server.listen(1123)
  t.same(await r2.head(url).text, '')
  await server.close()
})

test('delete', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.method, 'DELETE')
    res.end('test')
  })
  await server.listen(1123)
  t.same(await r2.delete(url).text, 'test')
  await server.close()
})

test('patch', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(req.method, 'PATCH')
    res.end('test')
  })
  await server.listen(1123)
  t.same(await r2.patch(url).text, 'test')
  await server.close()
})

test('put buffer', async t => {
  t.plan(3)
  let server = createServer(async (req, res) => {
    t.same(req.url, '/test')
    t.same(await body(req), 'test')
    res.end('ok')
  })
  await server.listen(1123)
  t.same(await r2.put(url, {body: Buffer.from('test')}).text, 'ok')
  await server.close()
})
