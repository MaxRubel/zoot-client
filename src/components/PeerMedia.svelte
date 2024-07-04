<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../stores/media/audioContext";
  import MicOffRed from "../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../stores/media/audioContext";
  export let connection;
  export let updatePresenter;
  export let peerId;

  let videoElement;
  let videoPaused = false;
  let micMuted = false;
  let presenting = false;
  let initialized = false;
  let pauseImage = "/relax2.webp";
  let loudest;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  $: {
    if (videoElement) {
      if (loudest?.id === peerId && loudest?.level > 0.03) {
        videoElement.style.border = "3px solid green";
      } else {
        videoElement.style.border = "none";
      }
    }
  }

  onDestroy(unsubscribe);

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
        if (m.data.includes("startScreenShare")) {
          const [, id] = m.data.split("-");
          updatePresenter(id);
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
          case "stopScreenShare":
            updatePresenter(null);
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
