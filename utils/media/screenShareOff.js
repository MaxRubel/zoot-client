import { updateUserState } from "../../stores/media/userState";

export async function screenShareOff(peerConnections, dataChannels) {
  const cameraStream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  const cameraTrack = cameraStream.getVideoTracks()[0];

  for (const connection of Object.values(peerConnections)) {
    const videoSender = connection.getSenders().find(sender =>
      sender.track && sender.track.kind === 'video'
    );

    if (videoSender) {
      await videoSender.replaceTrack(cameraTrack);
    } else {
      console.log("theres no sender")
    }
  }
  Object.values(dataChannels).forEach((chan) => {
    chan.send(`endscreenshare`)
  })
  updateUserState("sharing_screen", null)
}