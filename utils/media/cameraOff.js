export const cameraOff = async (peerConnections) => {
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.getTracks().forEach((t) => (t.enabled = false));
    const connections = Object.values(peerConnections);
    
    connections.forEach((conn) => {
        const videoSender = conn.getSenders().find(function (s) {
          return s.track?.kind === "video";
        });
        if (videoSender) {
          videoSender.track.enabled = false;
        }
      });
  };