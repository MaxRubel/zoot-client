import { screenShareOff } from "./screenShareOff";

export async function screenShareOn(peerConnections) {

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  const screenTrack = stream.getVideoTracks()[0];
  screenTrack.addEventListener('ended', () => {
    screenShareOff(peerConnections);
  });

  for (const connection of Object.values(peerConnections)) {
    const videoSender = connection.getSenders().find(sender => sender.track && sender.track.kind === 'video');

    if (videoSender) {
      await videoSender.replaceTrack(screenTrack);
    }
  }

}