import { loudestPeer } from "../../stores/media/audioContext"
import { get } from 'svelte/store';
import { userState } from "../../stores/media/userState";

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
    }
  }

  if (localAnalyserNode && localDataArray) {
    if (get(userState).audioOn) {
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
  // console.log("analyzing levels of ", Object.values(levels).length, " users")
  loudestPeer.set({ level: maxLevel, id: maxLevelPeerId });
};

export const analyzeAudioLevels = (peerConnections, localStream, myId, audioContext) => {
  // console.log("starting audio analysis")
  // console.log("peer connections: ", peerConnections)
  // console.log("my audio stream: ", localStream)
  // console.log("my id is ", myId)
  // console.log("my audio context is ", audioContext)
  if (analyzerLoop) {
    clearInterval(analyzerLoop)
  }
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