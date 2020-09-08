/*
  A class library for predefined messages.

  All methods return a string, which is intended to be broadcast to the IPFS
  pubsub channel.
*/

class Messages {
  constructor (config) {
    this.ipfsId = config.ipfsId
    this.bchAddr = config.bchAddr
    this.slpAddr = config.slpAddr
    this.publicKey = config.publicKey
  }

  // Initial message that peers use to announce themselves.
  announce () {
    const msgObj = {
      schema: 'v1.0.1',
      msgType: 'announce',
      ipfsId: this.ipfsId,
      bchAddr: this.bchAddr,
      slpAddr: this.slpAddr,
      publicKey: this.publicKey
    }

    return JSON.stringify(msgObj, null, 2)
  }
}

module.exports = Messages
