export function micOn(peerConnections) {

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((mediaStream) => {
        const audioTrack = mediaStream.getAudioTracks()[0];
        audioTrack.enabled = true;

        const connections = Object.values(peerConnections);
        connections.forEach((conn) => {
          const audioSender = conn
            .getSenders()
            .find((s) => s.track?.kind === "audio");
          if (audioSender) {
            audioSender.replaceTrack(audioTrack);
          } else {
            conn.addTrack(audioTrack, mediaStream);
          }
        });
      })
      .catch(function (error) {
        console.error("Error accessing the microphone:", error);
      });

    return true;
  };