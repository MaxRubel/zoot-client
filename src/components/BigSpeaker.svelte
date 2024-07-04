<script>
  import { onDestroy, onMount } from "svelte";
  import MicOffRed from "../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../stores/media/audioContext";

  export let connection;
  export let peerId;
  export let small;
  export let peerStates;
  // export let iAmSpeaking;

  let videoElement;
  let square;
  let videoPaused = false;
  let micMuted = false;
  let pauseImage = "/relax2.webp";

  $: if (connection && peerStates) {
    console.log("changing");
    updateVideoStream();
  }

  function updateVideoStream() {
    const remoteStreams = connection.getRemoteStreams();
    if (remoteStreams.length > 0 && videoElement) {
      videoElement.srcObject = remoteStreams[0];
    }
    videoPaused = !peerStates[peerId].videoOn;
    pauseImage = peerStates[peerId].pauseImage;
  }
</script>

<div class="peer-media-square">
  <div class="border {small && 'small'}" bind:this={square}></div>
  <video
    bind:this={videoElement}
    class="video-big"
    style="display: {videoPaused ? 'none' : 'block'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    style="display: {videoPaused ? 'block' : 'none'}"
    alt=""
  />
  <div
    class="mic-symbol centered"
    style="display: {micMuted ? 'block' : 'none'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .mic-symbol {
    position: absolute;
    bottom: 3px;
    left: 10px;
    color: rgb(30, 30, 30);
    background-color: rgb(248, 250, 285, 0.7);
    border-radius: 7px;
    padding: 1px 0px;
    padding-bottom: 6px;
    padding-left: 1px;
  }

  .video-big {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .small-text {
    font-size: 10pt;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
  }
  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
  .small {
    width: 200px;
  }
</style>
