<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let localVideo;

  let myId;
  let loudest;
  let square;
  let timeout;
  let borderTimeout;
  let videoElement;
  let user_state;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  const unsubscribe2 = clientId.subscribe((value) => {
    myId = value;
  });

  const unsubscribe3 = userState.subscribe((value) => {
    user_state = value;
  });

  $: {
    if (square) {
      if (loudest?.id === myId && loudest?.level > 0.007) {
        square.style.border = "3px solid rgb(240, 248, 255, .4)";
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
    if (videoElement && localVideo) {
      videoElement.srcObject = localVideo;
    }
  }
</script>

<div
  class="peer-media-square gallery"
  style="display: {user_state.hideSelf ? 'none' : 'block'}"
>
  <div class="border-gallery" bind:this={square}></div>

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
    class="image-gallery"
    style="display: {user_state.videoOn ? 'none' : 'block'}"
    alt=""
  />

  <div
    class="gallery-mic"
    style="display: {user_state.audioOn ? 'none' : 'block'}"
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

  .image-gallery {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }

  .large-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
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
