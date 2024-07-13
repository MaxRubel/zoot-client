<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { onDestroy } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let localVideo;

  let square;
  let videoElement;
  let user_state;

  const unsubscribe3 = userState.subscribe((value) => {
    user_state = value;
  });

  onDestroy(() => {
    unsubscribe3();
  });

  $: {
    if (videoElement && localVideo) {
      videoElement.srcObject = localVideo;
    }
  }
</script>

<div
  class="peer-media-square"
  style="display: {user_state.hideSelf ? 'none' : 'block'}"
>
  <div class="border" bind:this={square}></div>

  <video
    bind:this={videoElement}
    class="large-video"
    style="display: {user_state.videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={user_state.pauseImage}
    class="paused-image image-large"
    style="display: {user_state.videoOn ? 'none' : 'block'}"
    alt=""
  />

  <div
    class="mic-symbol centered"
    style="display: {user_state.audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
  }

  .image-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
</style>
