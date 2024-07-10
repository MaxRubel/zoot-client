<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { peerStates } from "../../../stores/media/peerStates";
  import { onDestroy, onMount } from "svelte";

  export let connection;
  export let peerId;

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

  onMount(() => {
    // console.log(connection);
    // console.log(peerState);
    // console.log(videoElement);
  });
</script>

<div class="peer-media-square">
  <video
    bind:this={videoElement}
    class="video-screen-share"
    style="display: {peerState?.videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={peerState?.pauseImage}
    style="display: {peerState?.videoOn ? 'none' : 'block'}"
    class={"image-large"}
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
  .image-large {
    object-fit: contain;
  }

  .video-screen-share {
    /* max-width: 100%; */
    min-width: 1000px;
    height: 80vh;
    object-fit: fill;
  }

  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
</style>
