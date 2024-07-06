<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy, onMount } from "svelte";
  import { userPreferences } from "../../../stores/media/userPreferences";

  export let pauseImage;
  export let videoOn;
  export let audioOn;
  export let videoStream;

  let square;
  let videoElement;
  let userPrefs;

  const unsubscribe3 = userPreferences.subscribe((value) => {
    userPrefs = value;
  });

  onDestroy(() => {
    unsubscribe3();
  });

  $: {
    if (videoElement && videoStream) {
      videoElement.srcObject = videoStream;
    }
  }

  onMount(() => {
    console.log("here i am on the big speaker");
  });
</script>

<div
  class="peer-media-square"
  style="display: {userPrefs.hideSelf ? 'none' : 'block'}"
>
  <div class="border" bind:this={square}></div>

  <video
    bind:this={videoElement}
    class="large-video"
    style="display: {videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    class="paused-image image-large"
    style="display: {videoOn ? 'none' : 'block'}"
    alt=""
  />

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
    height: 100%;
    width: 100%;
    overflow: hidden;
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
    margin: 0px;
    min-height: 125px;
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
</style>
