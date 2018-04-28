require('lookup-multicast-dns/global')
const debug = require('debug')('peer')
// const streamSet = require('stream-set')
const hashToPort = require('hash-to-port')
const airswarm = require('airswarm')
// const topology = require('fully-connected-topology')
const register = require('register-multicast-dns')
const level = require('level')
const scuttleup = require('scuttleup')
const chalk = require('chalk')
const ansi = require('ansi-escapes')

const me = process.argv[2] || process.env.USER
// const peers = process.argv.slice(3)

// const swarm = topology(toAddress(me), peers.map(toAddress))
// const connections = streamSet()
const db = level(me + '.db')
const logs = scuttleup(db, {valueEncoding: 'json'})

register(me)
debug(me + '.local:' + hashToPort(me))

// swarm.on('connection', (socket, id) => {
airswarm('me', socket => {
  // console.log(`${chalk.dim('info>')} new connection from ${'id'}`)
  socket
    .pipe(logs.createReplicationStream({live: true}))
    .pipe(socket)
  // connections.add(socket)
})

logs.createReadStream({live: true, tail: true})
  .on('data', data => {
    console.log(`${chalk.dim(data.entry.username + '>')} ${data.entry.message}`)
  })

process.stdin.on('data', data => {
  const message = data.toString().trim()
  process.stdout.write(ansi.cursorPrevLine + ansi.eraseLine)
  if (message.length === 0) return
  logs.append({username: me, message})
})
