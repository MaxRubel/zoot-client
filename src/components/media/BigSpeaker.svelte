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

  onMount(() => {
    console.log("new speaker here!");
  });
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
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
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
