import { get } from "svelte/store";
import { updateUserState } from "../../stores/media/userState";
import { dataChannelsStore, peerConnectionsStore } from "../../stores/media/roomStore"

export async function screenShareOff() {

  const peerConnections = get(peerConnectionsStore)
  const dataChannels = get(dataChannelsStore)

  const cameraStream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  const cameraTrack = cameraStream.getVideoTracks()[0];

  const replacementPromises = Object.values(peerConnections).map(async (connection) => {
    const videoSender = connection.getSenders().find(sender =>
      sender.track && sender.track.kind === 'video'
    );

    if (videoSender) {
      await videoSender.replaceTrack(cameraTrack);
    }
  });

  await Promise.all(replacementPromises);

  Object.values(dataChannels).forEach((chan) => {
    chan.send(`endscreenshare`);
  });

  updateUserState("sharing_screen", false);
}