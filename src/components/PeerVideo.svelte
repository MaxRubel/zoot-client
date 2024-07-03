<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../stores/media/audioContext";
  import MicOffRed from "../assets/MicOffRed.svelte";
  export let connection;

  let videoElement;
  let videoPaused = false;
  let micMuted = false;
  let presenting = false;
  let initialized = false;
  let pauseImage = "/relax2.webp";

  $: console.log(pauseImage);
  onMount(() => {
    const audioContext = getAudioContext();

    //receive and connect to audio track:
    connection.ontrack = (event) => {
      if (event.track.kind === "audio") {
        const audioStream = new MediaStream([event.track]);
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(audioContext.destination);
      }
      if (event.streams && event.streams[0] && event.track.kind === "video") {
        videoElement.srcObject = event.streams[0];
      }
    };

    const unpackReport = (data) => {
      const [_, report] = data.split("-");
      const parsed = JSON.parse(report);
      videoPaused = !parsed.videoOn;
      micMuted = !parsed.audioOn;
      presenting = parsed.presenting;
      initialized = true;
      pauseImage = parsed.pauseImage;
    };

    //receive data from peer:
    connection.ondatachannel = (e) => {
      e.channel.onmessage = (m) => {
        if (m.data.includes("report")) {
          unpackReport(m.data);
        }
        if (m.data.includes("camera-muted")) {
          videoPaused = true;
          const [, , parsed] = m.data.split("-");
          pauseImage = parsed;
        }
        switch (m.data) {
          case "camera-live":
            videoPaused = false;
            break;
          case "mic-muted":
            micMuted = true;
            break;
          case "mic-live":
            micMuted = false;
            break;
        }
      };
    };
  });
</script>

<div
  class="peer-media-square"
  style="display: {initialized ? 'block' : 'none'};"
>
  <video
    bind:this={videoElement}
    style="display: {videoPaused ? 'none' : 'block'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    style="display: {videoPaused ? 'block' : 'none'}"
    alt=""
  />
  <div
    class="mic-symbol centered"
    style="display: {micMuted ? 'block' : 'none'}"
  >
    <MicOffRed />
  </div>
</div>

<div
  class="connecting centered"
  style="display: {initialized ? 'none' : 'flex'};"
>
  Connecting...
</div>

<style>
  .peer-media-square {
    position: relative;
  }

  .mic-symbol {
    color: rgb(189, 38, 38);
    background-color: rgb(0, 0, 0, 0.8);
    border-radius: 10px;
    width: 28px;
    height: 34px;
    position: absolute;
    bottom: 3px;
    left: 10px;
    padding-left: 3px;
    padding-top: 1px;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
</style>
