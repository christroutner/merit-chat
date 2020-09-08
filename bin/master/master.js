/*
  A 'master' node that sets up a common connection point for chat peers.
*/

const Room = require('ipfs-pubsub-room')
const IPFS = require('ipfs')

// Ipfs Options
const ipfsOptions = {
  repo: './chatdata',
  start: true,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: ['/ip4/0.0.0.0/tcp/5004', '/ip4/190.198.70.169/tcp/5005/ws'],
      API: '/ip4/127.0.0.1/tcp/5006',
      Gateway: '/ip4/127.0.0.1/tcp/5007',
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

async function startMasterNode () {
  try {
    // Starting ipfs node
    console.log('Starting...')
    const ipfs = await IPFS.create(ipfsOptions)
    console.log('... IPFS is ready.\n')

    const room = new Room(ipfs, 'room-name')

    room.on('peer joined', peer => {
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
  } catch (err) {
    console.error('Error: ', err)
  }
}
startMasterNode()
