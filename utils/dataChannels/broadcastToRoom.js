export function broadcastToRoom(dataChannels, message) {
  Object.values(dataChannels).forEach((chan) => {
    chan.send(message)
  })
}