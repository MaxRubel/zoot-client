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
  export let small;
  export let videoStream;
  export let gallery;

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
    if (square && (small || gallery)) {
      if (loudest?.id === myId && loudest?.level > 0.1) {
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

  $: console.log(videoOn);
  $: console.log(userPrefs.hideSelf);
</script>

<div
  class="{small ? 'small-row-square' : 'peer-media-square'}{gallery &&
    ' gallery'}"
  style="display: {userPrefs.hideSelf ? 'none' : 'block'}"
>
  {#if gallery}
    <div class="border-gallery" bind:this={square}></div>
  {:else}
    <div class="border" bind:this={square}></div>
  {/if}
  <video
    bind:this={videoElement}
    class={small ? "small-video" : "large-video"}
    style="display: {videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  {#if small}
    <img
      src={pauseImage}
      class="paused-image image-small"
      style="display: {videoOn ? 'none' : 'block'}"
      alt=""
    />
  {/if}

  {#if gallery}
    <img
      src={pauseImage}
      class="image-gallery"
      style="display: {videoOn ? 'none' : 'block'}"
      alt=""
    />
  {/if}

  {#if !small && !gallery}
    <img
      src={pauseImage}
      class="paused-image image-large"
      style="display: {videoOn ? 'none' : 'block'}"
      alt=""
    />
  {/if}

  <div
    class={gallery ? "gallery-mic" : "mic-symbol centered"}
    style="display: {audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .gallery {
    min-height: 400px;
  }

  .border-gallery {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    z-index: 2;
  }

  .image-small {
    flex: 0 0 auto;
    width: 200px;
    height: auto;
    aspect-ratio: 4/3;
    object-fit: fill;
    max-width: 100%;
    max-height: 100%;
  }

  .image-large {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 0;
    left: 0;
  }

  .paused-image {
    max-height: 18vh;
    margin: 0px;
    min-height: 125px;
  }

  .image-gallery {
    width: 100%;
    height: 100%;
    object-fit: fill;
    position: absolute;
    top: 0;
    left: 0;
  }

  .small-video {
    flex: 0 0 auto;
    width: 200px;
    max-height: 18vh;
    min-height: 125px;
    aspect-ratio: 4/3;
    object-fit: cover;
  }

  .large-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    top: 0;
    left: 0;
  }

  .border {
    position: absolute;
    height: 100%;
    width: 100%;
    bottom: 0;
    left: 36px;
    width: 200px;
  }

  .mic-symbol {
    position: absolute;
    bottom: 4px;
    left: 42px;
    position: absolute;
    color: rgb(30, 30, 30);
    background-color: rgb(248, 250, 285, 0.7);
    border-radius: 7px;
    padding-bottom: 3px;
  }

  .gallery-mic {
    position: absolute;
    bottom: 4px;
    left: 10px;
    position: absolute;
    color: rgb(30, 30, 30);
    background-color: rgb(248, 250, 285, 0.7);
    border-radius: 7px;
    padding-bottom: 3px;
  }
</style>
