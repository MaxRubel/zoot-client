import { loudestPeer } from "../../stores/media/audioContext"
import { getUserSelection } from "../../stores/media/mediaSelection";



let analyzerLoop = null;
let localAnalyserNode = null;
let localDataArray = null;

const analyze = (peerConnections, localStream, myId, audioContext) => {
  const levels = {};
  if (!localStream || !audioContext) { return }
  // Analyze remote peers
  Object.entries(peerConnections).forEach(([peerId, peer]) => {
    const receiver = peer.getReceivers().find((r) => r.track.kind === "audio");
    if (receiver && receiver.getSynchronizationSources) {
      const source = receiver.getSynchronizationSources()[0];
      if (source) {
        levels[peerId] = source.audioLevel;
      }
    }
  });

  // Analyze local audio
  if (!localAnalyserNode) {
    const audioTrack = localStream.getTracks().find((t) => t.kind === "audio");
    if (audioTrack && audioContext) {
      const sourceNode = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
      localAnalyserNode = audioContext.createAnalyser();
      sourceNode.connect(localAnalyserNode);
      localAnalyserNode.fftSize = 256;
      localDataArray = new Uint8Array(localAnalyserNode.frequencyBinCount);
      console.log("local audio: ", audioTrack)
    }
  }

  const { audioOn } = getUserSelection()

  if (localAnalyserNode && localDataArray) {
    if (audioOn) {
      localAnalyserNode.getByteFrequencyData(localDataArray);
      const average = localDataArray.reduce((sum, value) => sum + value, 0) / localDataArray.length;
      const volume = average / 255;
      levels[myId] = volume;
    } else {
      levels[myId] = 0;
    }
  }
  // Find the loudest peer
  let maxLevelPeerId = null;
  let maxLevel = -Infinity;
  Object.entries(levels).forEach(([peerId, level]) => {
    if (level > maxLevel) {
      maxLevel = level;
      maxLevelPeerId = peerId;
    }
  });
  // console.log(levels)
  loudestPeer.set({ level: maxLevel, id: maxLevelPeerId });
};

export const analyzeAudioLevels = (peerConnections, localStream, myId, audioContext) => {
  analyzerLoop = setInterval(() => {
    analyze(peerConnections, localStream, myId, audioContext);
  }, 150);
};

export const stopAnalyzingAudioLevels = () => {
  if (analyzerLoop) {
    clearInterval(analyzerLoop);
    analyzerLoop = null;
  }
};