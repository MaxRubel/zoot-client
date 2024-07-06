<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy } from "svelte";
  import { userPreferences } from "../../../stores/media/userPreferences";

  export let pauseImage;
  export let videoOn;
  export let audioOn;
  export let iAmSpeaking;
  export let videoStream;

  let myId;
  let loudest;
  let square;
  let timeout;
  let borderTimeout;
  let videoElement;
  let userPrefs;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  const unsubscribe2 = clientId.subscribe((value) => {
    myId = value;
  });

  const unsubscribe3 = userPreferences.subscribe((value) => {
    userPrefs = value;
  });

  $: {
    if (square) {
      if (loudest?.id === myId && loudest?.level > 0.007) {
        square.style.border = "3px solid rgb(240, 248, 255, .4)";
        iAmSpeaking(myId);
      } else {
        square.style.border = "none";
      }
    }
  }

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
    clearTimeout(timeout);
    clearTimeout(borderTimeout);
  });

  $: {
    if (videoElement && videoStream) {
      videoElement.srcObject = videoStream;
    }
  }
</script>

<!-- <div
  class="small-row-square"
  style="display: {userPrefs.hideSelf ? 'none' : 'block'}"
>
  <div class="border" bind:this={square}></div>

  <video
    bind:this={videoElement}
    class="small-video"
    style="display: {videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    class="paused-image image-small"
    style="display: {videoOn ? 'none' : 'block'}"
    alt=""
  />

  <div
    class="mic-symbol centered"
    style="display: {audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div> -->

<div class="peer-media-square">
  <div class="border" bind:this={square}></div>
  <div class="media-container">
    <video
      class="video-normal"
      style="display: {videoOn ? 'block' : 'none'}"
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    >
      <track kind="captions" />
    </video>
    <img
      src={pauseImage}
      class="pause-image"
      style="display: {videoOn ? 'none' : 'block'}"
      alt=""
    />
  </div>
  <div
    class="mic-symbol centered"
    style="display: {audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    position: relative;
  }

  .border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
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

  .media-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-normal {
    width: 200px;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    transition: opacity 0.5s ease-in;
    z-index: 5;
  }

  img {
    aspect-ratio: 4/3;

    width: 200px;
    height: 100%;
    object-fit: fill;
    opacity: 1;
  }
</style>
