export const silentAudioTrack = async () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
}

export async function micOff() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioTrack = stream.getAudioTracks()[0]

  console.log(audioTrack)

  audioTrack.enabled = false
  console.log(audioTrack)
}