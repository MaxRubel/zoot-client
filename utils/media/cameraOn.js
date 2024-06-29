export const cameraOn = async (peerConnections) => {
  let videoStream;
  console.log("starting stream")
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.getTracks().forEach((t) => {
      t.enabled = true
    });
  } catch (error) {
    console.error("Error accessing the webcam:", error);
  }

  const connections = Object.values(peerConnections);
  connections.forEach((conn) => {
    const videoSender = conn.getSenders().find((s) => s.track?.kind === "video");
    if (videoSender) {
      videoSender.track.enabled = true;
    }
  });

  return videoStream;
};