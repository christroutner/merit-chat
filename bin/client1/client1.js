/*
  A 'client' node
*/

// Change these constants to fit your environment.
const MASTER_MULTIADDR = '/ip4/127.0.0.1/tcp/5004/p2p/'
const MASTER_IPFS_ID = 'Qma7XadmQ2LwVi6jkFtZJEBxDaNQwbyjj1TBQiUGxjeKrR'
const ROOM_NAME = 'room-name'
const MNEMONIC =
  'creek caution crouch bid route gold prepare need above movie broom denial'

// Global npm libraries
const Room = require('ipfs-pubsub-room')
const IPFS = require('ipfs')

// Local libraries
const Signing = require('../../lib/signing')
const Messages = require('../../lib/messages')
const MsgFilter = require('../../lib/msg-filter')
const Peer = require('../../lib/peer')

let msgLib
const msgFilter = new MsgFilter()
let ipfsId // Used to track the IPFS ID of this node.
let peers = [] // Used to hold instances of the Peer class.
let ipfs // instance of IPFS for this node.

// Ipfs Options
const ipfsOptions = {
  repo: './chatdata',
  start: true,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: ['/ip4/0.0.0.0/tcp/5104', '/ip4/190.198.70.169/tcp/5105/ws'],
      API: '/ip4/127.0.0.1/tcp/5106',
      Gateway: '/ip4/127.0.0.1/tcp/5107',
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
    ipfs = await IPFS.create(ipfsOptions)
    console.log('... IPFS is ready.\n')

    // Connect to the master node.
    await ipfs.swarm.connect(`${MASTER_MULTIADDR}/${MASTER_IPFS_ID}`)
    console.log(`Connected to ${MASTER_MULTIADDR}/${MASTER_IPFS_ID}\n`)

    // console.log('ipfs: ', ipfs)

    // Create a BCH wallet
    console.log('BCH and SLP addresses:')
    const wallet = new Signing(MNEMONIC)
    await wallet.isReady // Wait for wallet to initialize.
    console.log(' ')

    // Get the IPFS ID for this node.
    ipfsId = await ipfs.config.get('Identity')
    ipfsId = ipfsId.PeerID

    // Get the local addresses this node is listening to.
    const localAddrs = await ipfs.swarm.localAddrs()
    // console.log(`localAddrs: ${JSON.stringify(localAddrs, null, 2)}`)

    // Initialize the Message library.
    const msgConfig = {
      ipfsId,
      bchAddr: wallet.bchAddr,
      slpAddr: wallet.slpAddr,
      publicKey: wallet.publicKey,
      localAddrs
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

    await sleep(2000)

    if (peer !== ipfsId) {
      // Connect directly to the new peer.
      await ipfs.swarm.connect(`${MASTER_MULTIADDR}/${peer}`)

      // room.sendTo() NOT WORKING
      // Send connection information to new peers as the enter the room.
      // await room.sendTo(peer, msgLib.announce())
    }
  })

  room.on('peer left', peer => {
    console.log('Peer left...', peer)

    // Filter out the peer that just left from the list of peers.
    const newPeers = peers.filter(x => x.ipfsId !== peer)
    peers = newPeers
  })

  // now started to listen to room
  room.on('subscribed', () => {
    console.log('Now connected!')
  })

  // Event triggers on new messages.
  room.on('message', async message => {
    // console.log(`${message.from}: ${message.data}`)
    const data = msgFilter.parse(message)

    // If the data is noise and can not be parsed, ignore it.
    if (!data) return

    // If the message was not sourced from this node.
    // Ensures this node ignores its own messages.
    if (data.ipfsId !== ipfsId) {
      console.log(`message data: ${JSON.stringify(data, null, 2)}`)

      // If the message is a new peer joining the network, create a new peer
      // instance.
      if (data.msgData.msgType === 'announce') {
        const id = data.ipfsId

        // Create a new Peer object.
        const newPeer = new Peer(data.msgData)

        const existingPeer = peers.filter(x => x.ipfsId === id)
        if (existingPeer.length === 0) {
          // Add the peer to the array for tracking peers.
          peers.push(newPeer)
          console.log(`Peer ${id} added to peers array.`)
          console.log(`peers array: ${JSON.stringify(peers, null, 2)}`)
        }
      }
    }
  })
}

// Promise based sleep function:
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
