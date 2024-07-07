<script>
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let iAmSpeaking;
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
    if (videoElement && localVideo) {
      videoElement.srcObject = localVideo;
    }
  }
</script>

<div
  class="peer-media-square"
  style="display: {user_state.hideSelf ? 'none' : 'block'};"
>
  <div class="border" bind:this={square}></div>
  <div class="media-container">
    <video
      class="video-normal"
      style="display: {user_state.videoOn ? 'block' : 'none'}"
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    >
      <track kind="captions" />
    </video>
    <img
      src={user_state.pauseImage}
      class="pause-image"
      style="display: {user_state.videoOn ? 'none' : 'block'}"
      alt=""
    />
  </div>
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
