export const silentAudioTrack = async () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
}

export async function micOff(peerConnections) {
  const connections = Object.values(peerConnections);
  connections.forEach((conn) => {
    const audioSender = conn
      .getSenders()
      .find((s) => s.track?.kind === "audio");
    if (audioSender && audioSender.track) {
      audioSender.track.enabled = false;
      audioSender.track.dispatchEvent(new Event("mute"));
    }
  });
}