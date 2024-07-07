import { updateUserState } from "../../stores/media/userState";

export const cameraOn = async (peerConnections) => {
  let localVideo;
  try {
    localVideo = await navigator.mediaDevices.getUserMedia({ video: true });
    localVideo.getTracks().forEach((t) => {
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
  updateUserState("videoOn", true)
  return localVideo;
};