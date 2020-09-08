/*
  A library for tracking and working with peers.
*/

class Peers {
  constructor (peerInfo) {
    this.ipfsId = peerInfo.ipfsId
    this.bchAddr = peerInfo.bchAddr
    this.slpAddr = peerInfo.slpAddr
    this.publicKey = peerInfo.publicKey
  }
}

module.exports = Peers
