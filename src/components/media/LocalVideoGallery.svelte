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
  <div class="border" bind:this={square}></div>

  <video
    bind:this={videoElement}
    class="media-content"
    style="display: {user_state.videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={user_state.pauseImage}
    class="media-content"
    style="display: {user_state.videoOn ? 'none' : 'block'}"
    alt=""
  />

  <div
    class="mic-symbol"
    style="display: {user_state.audioOn ? 'none' : 'block'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    /* border: 1px solid rgba(224, 255, 255, 0.482); */
  }

  .border {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    z-index: 2;
  }

  .media-content {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
