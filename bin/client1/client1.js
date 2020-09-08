/*
  A 'client' node
*/

const MASTER_MULTIADDR = '/ip4/127.0.0.1/tcp/5004/p2p/QmZqyq4ZAmmHGyV6XSJLV8vjiEKbwLrAgd46BdraL6wPqu'
const ROOM_NAME = 'room-name'

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
    const ipfs = await IPFS.create(ipfsOptions)
    console.log('... IPFS is ready.')

    await ipfs.swarm.connect(MASTER_MULTIADDR)
    console.log(`Connected to ${MASTER_MULTIADDR}`)

    const room = new Room(ipfs, 'room-name')

    room.on('peer joined', peer => {
      console.log('Peer joined the room', peer)
    })

    room.on('peer left', peer => {
      console.log('Peer left...', peer)
    })

    // now started to listen to room
    room.on('subscribed', () => {
      console.log('Now connected!')
    })
  } catch (err) {
    console.error('Error: ', err)
  }
}
startClientNode()
