import { loudestPeer } from "../../stores/media/audioContext"

const analyze = (peerConnections) => {
  const levels = {}
  Object.entries(peerConnections).forEach(([peerId, peer]) => {
    const receiver = peer.getReceivers().find((r) => r.track.kind === "audio")
    if (receiver && receiver.getSynchronizationSources) {
      const source = receiver.getSynchronizationSources()[0]
      if (source) {
        levels[peerId] = source.audioLevel
      }
    }
  })

  let maxLevelPeerId = null
  let maxLevel = -Infinity

  Object.entries(levels).forEach(([peerId, level]) => {
    if (level > maxLevel) {
      maxLevel = level
      maxLevelPeerId = peerId
    }
  })
  loudestPeer.set({ level: maxLevel, id: maxLevelPeerId })
}

let intervalId

export const analyzeAudioLevels = (peerConnections) => {
  intervalId = setInterval(() => {
    analyze(peerConnections)
  }, 300)
}

export const stopAnalyzingAudioLevels = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
}