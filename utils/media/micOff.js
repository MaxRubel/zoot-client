export const micOff = (peerConnections) => {
    const connections = Object.values(peerConnections);
    connections.forEach((conn) => {
      const audioSender = conn
        .getSenders()
        .find((s) => s.track?.kind === "audio");
      if (audioSender && audioSender.track) {
        audioSender.track.enabled = false;
        // Optionally, dispatch a mute event
        audioSender.track.dispatchEvent(new Event("mute"));
      }
    });
  };