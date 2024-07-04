function setupLoudestStreamDetection(peerConnections, audioContext) {
    let loudestStream = null;
    let maxVolume = -Infinity;
    const analyzers = new Map();
  
    Object.values(peerConnections).forEach(peer => {
      let analyser = peer.audioAnalyzer || audioContext.createAnalyser();
      if (!peer.audioAnalyzer) {
        const audioTrack = peer.getRemoteStreams()[0].getAudioTracks()[0];
        const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
        source.connect(analyser);
        peer.audioAnalyzer = analyser;
      }
      analyzers.set(peer, analyser);
    });
  
    function checkVolumes() {
      maxVolume = -Infinity;
      analyzers.forEach((analyser, peer) => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
  
        if (volume > maxVolume) {
          maxVolume = volume;
          loudestStream = peer;
        }
      });
      return loudestStream;
    }
  
    const intervalId = setInterval(() => {
      const currentLoudest = checkVolumes();
      // You can add a callback here if you want to do something with the result every 100ms
      // For example: onLoudestStreamChange(currentLoudest);
    }, 100);
  
    return {
      getLoudestStream: checkVolumes, // This will check volumes and return the loudest stream immediately when called
      stopDetection: () => clearInterval(intervalId)
    };
  }