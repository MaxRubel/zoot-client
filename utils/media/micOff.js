import { updateUserState } from "../../stores/media/userState";

export const micOff = (peerConnections, stream) => {
  updateUserState("audioOn", false)
  //Mute local audio
  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = false;
  }

  // Mute all peer connections
  Object.values(peerConnections).forEach((conn) => {
    const audioSender = conn
      .getSenders()
      .find((s) => s.track?.kind === "audio");
    if (audioSender && audioSender.track) {
      audioSender.track.enabled = false;
    }
  });

};