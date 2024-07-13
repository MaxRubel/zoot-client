<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { peerStates } from "../../../stores/media/peerStates";
  import { onDestroy, onMount } from "svelte";

  export let connection;
  export let peerId;
  export let small;

  let videoElement;
  let peerState;

  const unsubscribe = peerStates.subscribe((value) => {
    if (value[peerId]) {
      peerState = value[peerId];
    }
  });

  onDestroy(unsubscribe);

  $: if (connection && peerState && videoElement) {
    updateVideoStream();
  }

  function updateVideoStream() {
    const remoteStreams = connection.getRemoteStreams();
    if (remoteStreams.length > 0 && videoElement) {
      videoElement.srcObject = remoteStreams[0];
    }
  }
</script>

<div class="peer-media-square">
  <video
    bind:this={videoElement}
    class="video-big"
    style="display: {peerState?.videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={peerState?.pauseImage}
    style="display: {peerState?.videoOn ? 'none' : 'block'}"
    class={small ? "image-small" : "image-large"}
    alt=""
  />
  <div
    class="mic-symbol centered"
    style="display: {peerState?.audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    aspect-ratio: 4/3;
    height: 65vh;
    overflow: hidden;
    position: relative;
  }

  .image-large {
    object-fit: contain;
  }

  .video-big {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 0;
    left: 0;
  }

  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
</style>
