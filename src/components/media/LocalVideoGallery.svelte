<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let localVideo;
  export let columns;

  let myId;
  let loudest;
  let square;
  let videoElement;
  let user_state;
  let localVidDiv;

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
  });

  $: {
    if (videoElement && localVideo) {
      videoElement.srcObject = localVideo;
    }
  }
</script>

<div
  class="video-tile"
  bind:this={localVidDiv}
  style="display: {user_state.hideSelf ? 'none' : 'block'}"
>
  <div class="border-gallery" bind:this={square}></div>

  <video
    bind:this={videoElement}
    class="media-content"
    class:hidden={!user_state.videoOn}
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={user_state.pauseImage}
    class="media-content"
    class:hidden={user_state.videoOn}
    alt=""
  />

  <div class="mic-symbol" class:hidden={user_state.audioOn}>
    <MicOffRed />
  </div>
</div>

<style>
  .video-tile {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;
  }

  .border-gallery {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }

  .media-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hidden {
    display: none;
  }

  .mic-symbol {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 20;
  }
</style>
