# merit-chat

This is a prototype chat application based on [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room). If I can get the p2p chat working, then I'll use it as a sandbox for developing e2e encryption and 'merit' calculations based on SLP tokens for the [PSF](https://psfoundation.cash).

## Setup
- `npm install`

## Usage
In four separate terminals, run the following commands, one at a time, in this order:
- `npm run master`
- `npm run client1`
- `npm run client2`
- `npm run client3`

The above commands will spin up four different IPFS nodes. The three clients will connect to the master node, and they will all subscribe to the same pubsub room. Every 5 minutes, a client will re-broadcast their connection info and the other clients will sync to it.

When two clients have synced (the `peers` array), they have enough information to send encrypted messages (`publicKey`), Bitcoin Cash (`bchAddr`), and SLP tokens (`slpAddr`).

## Moving Forward:
These are the next steps for moving forward with this prototype:
- Finish porting [signed-proof-chat](https://github.com/christroutner/signed-proof-chat) tests and then delete that repo. It was an earlier prototype.
- Add unit tests for the libraries that I've already developed.
- Add utilities for:
  - Look up the number of PSF tokens held by an address (an array of UTXOs representing token quantities)
  - Look up the coin ages for each PSF token UTXO held by an address (an array of UTXOs)
  - Calculate an average merit (averaged (coin x age) = merit)
- Investigate issues I had with [ipfs-pubsub-room](https://www.npmjs.com/package/ipfs-pubsub-room) `.sendTo()` method. File an issue if it's legitimately broken. Add code for sending private messages if not.
  - Or skip it and do this: Each new client node creates a `<bch address>` pubsub room. Any messages sent to this room must be e2e encrypted with the public key for that address. 

# Licence
[MIT](LICENSE.md)
