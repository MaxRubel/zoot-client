export async function resend_screenshare(peer_id, peerConnections) {

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });

  const screenTrack = stream.getVideoTracks()[0];

  for (const [id, connection] of Object.entries(peerConnections)) {
    if (id === peer_id) {
      const videoSender = connection.getSenders().find(sender => sender.track && sender.track.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(screenTrack);
      }
      break
    }
  }

  updateUserState("sharing_screen", true);

}