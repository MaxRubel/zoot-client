import { broadcastToRoom } from "../dataChannels/broadcastToRoom";
import { screenShareOff } from "./screenShareOff";

export async function screenShareOn(peerConnections, dataChannels, id, presenter, broadcast_end_screen_share, updatePresenter) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });

    const screenTrack = stream.getVideoTracks()[0];
    screenTrack.addEventListener('ended', () => {
      screenShareOff(peerConnections, dataChannels);
      broadcast_end_screen_share()
      updatePresenter(null)
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
    return id
  } catch (error) {
    return presenter
  }
}