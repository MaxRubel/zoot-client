<script>
  import MicOffRed from "../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../stores/media/audioContext";
  import { clientId } from "../../stores/auth_store";
  import { onDestroy, onMount } from "svelte";

  export let pauseImage;
  export let videoOn;
  export let audioOn;
  export let iAmSpeaking;
  export let small;
  export let videoStream;

  let myId;
  let loudest;
  let square;
  let borderActive = false;
  let timeout;
  let borderTimeout;
  let videoElement;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  const unsubscribe2 = clientId.subscribe((value) => {
    myId = value;
  });

  $: {
    if (square && small) {
      if (loudest?.id === myId && loudest?.level > 0.03) {
        clearTimeout(timeout);
        if (!borderActive) {
          borderActive = true;
          square.style.border = "3px solid rgb(240, 248, 255, .4)";
          iAmSpeaking(myId);
          console.log("i am speaking");
        }

        clearTimeout(borderTimeout);

        // Set a timeout to remove the border after 0.4 seconds
        borderTimeout = setTimeout(() => {
          borderActive = false;
          square.style.border = "none";
        }, 75);
      } else {
        if (borderActive) {
          // If loudest condition is not met, set a timeout to remove the border after 0.4 seconds
          borderTimeout = setTimeout(() => {
            if (!borderActive) {
              square.style.border = "none";
            }
          }, 75);
        }
      }
    }
  }

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    clearTimeout(timeout);
    clearTimeout(borderTimeout);
  });

  $: {
    if (videoElement) {
      videoElement.srcObject = videoStream;
    }
  }
</script>

<div class={small ? "small-row-square" : "peer-media-square"}>
  <div class="border" bind:this={square}></div>
  <video
    bind:this={videoElement}
    class={small ? "small-video" : "large-video"}
    style="display: {videoOn ? 'block' : 'none'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    class={small ? "paused-image image-small" : "image-large"}
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
    left: 0;
    width: 200px;
  }

  .mic-symbol {
    position: absolute;
    bottom: 4px;
    left: 2px;
    position: absolute;
    color: rgb(30, 30, 30);
    background-color: rgb(248, 250, 285, 0.7);
    border-radius: 7px;
    padding-bottom: 3px;
  }
</style>
