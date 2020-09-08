/*
  A 'client' node
*/

// Change these constants to fit your environment.
const MASTER_MULTIADDR = '/ip4/127.0.0.1/tcp/5004/p2p/Qma7XadmQ2LwVi6jkFtZJEBxDaNQwbyjj1TBQiUGxjeKrR'
const ROOM_NAME = 'room-name'
const MNEMONIC =
  'flat bench boss forest weasel frost pear loan journey start wish unit'

// Global npm libraries
const Room = require('ipfs-pubsub-room')
const IPFS = require('ipfs')

// Local libraries
const Signing = require('../../lib/signing')
const Messages = require('../../lib/messages')
let msgLib

// Ipfs Options
const ipfsOptions = {
  repo: './chatdata',
  start: true,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: ['/ip4/0.0.0.0/tcp/5204', '/ip4/190.198.70.169/tcp/5205/ws'],
      API: '/ip4/127.0.0.1/tcp/5206',
      Gateway: '/ip4/127.0.0.1/tcp/5207',
      Delegates: []
    }
  },
  relay: {
    enabled: true, // enable circuit relay dialer and listener
    hop: {
      enabled: true // enable circuit relay HOP (make this node a relay)
    }
  },
  pubsub: true
}

async function startClientNode () {
  try {
    // Starting ipfs node
    console.log('Starting...')
    const ipfs = await IPFS.create(ipfsOptions)
    console.log('... IPFS is ready.\n')

    // Connect to the master node.
    await ipfs.swarm.connect(MASTER_MULTIADDR)
    console.log(`Connected to ${MASTER_MULTIADDR}\n`)

    // Create a BCH wallet
    const wallet = new Signing(MNEMONIC)
    await wallet.isReady // Wait for wallet to initialize.

    // Get the IPFS ID for this node.
    let ipfsId = await ipfs.config.get('Identity')
    ipfsId = ipfsId.PeerID

    // Initialize the Message library.
    const msgConfig = {
      ipfsId,
      bchAddr: wallet.bchAddr,
      slpAddr: wallet.slpAddr,
      publicKey: wallet.publicKey
    }
    // console.log(`msgConfig: ${JSON.stringify(msgConfig, null, 2)}`)

    // Create an announcement message
    msgLib = new Messages(msgConfig)

    // Join the pubsub room.
    const room = new Room(ipfs, ROOM_NAME)

    // Set up the pubsub room event router.
    eventRouter(room)

    room.broadcast(msgLib.announce())
  } catch (err) {
    console.error('Error: ', err)
  }
}
startClientNode()

// A router for handling pubsub events.
function eventRouter (room) {
  room.on('peer joined', async peer => {
    console.log('Peer joined the room:', peer)
  })

  room.on('peer left', peer => {
    console.log('Peer left...', peer)
  })

  // now started to listen to room
  room.on('subscribed', () => {
    console.log('Now connected!')
  })

  room.on('message', (message) => {
    console.log(`${message.from}: ${message.data}`)
  })
}
