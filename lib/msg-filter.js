/*
  A library for filtering and parsing messages coming in from the pubsub channel.
*/

class MsgFilter {
  // Attempts to parse and classify JSON data coming in as pubsub messags.
  // If the data can not be processed, it returns false, so the message can be
  // ignored.
  parse (message) {
    const data = false

    try {
      const retObj = {}

      retObj.ipfsId = message.from
      retObj.msgData = JSON.parse(message.data)

      return retObj
    } catch (err) {
      return data
    }
  }
}

module.exports = MsgFilter
