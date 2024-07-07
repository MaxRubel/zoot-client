import { updateUserState } from "../../stores/media/userState";
import { screenShareOff } from "./screenShareOff";

export async function screenShareOn(
  peerConnections,
  dataChannels,
  id,
  presenter,
  broadcast_end_screen_share,
  update_screen_sharer) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });

    const screenTrack = stream.getVideoTracks()[0];
    screenTrack.addEventListener('ended', () => {
      screenShareOff(peerConnections, dataChannels);
      broadcast_end_screen_share()
      update_screen_sharer(null)
    });

    for (const connection of Object.values(peerConnections)) {
      const videoSender = connection.getSenders().find(sender => sender.track && sender.track.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(screenTrack);
      }
    }

    Object.values(dataChannels).forEach((chan) => {
      chan.send(`startScreenShare&${id}`)
    });

    updateUserState("sharing_screen", screenTrack)

    return id
  } catch (error) {
    return presenter
  }
}