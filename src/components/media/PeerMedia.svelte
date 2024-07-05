<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../../stores/media/audioContext";
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";

  export let connection;
  export let peerId;
  export let small;
  export let iAmSpeaking;
  export let updatePeerStates;
  export let peerStates;
  export let gallery;

  let videoElement;
  let square;
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
    if (square) {
      if (loudest?.id === peerId && loudest?.level > 0.007) {
        square.style.border = "3px solid rgb(240, 248, 255, .4)";
        iAmSpeaking(peerId);
      } else {
        square.style.border = "none";
      }
    }
  }

  onDestroy(() => {
    unsubscribe();
  });

  onMount(() => {
    const audioContext = getAudioContext();
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
      updatePeerStates(peerId, parsed);
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
          updatePeerStates(peerId, {
            ...peerStates[peerId],
            pauseImage: parsed,
            videoOn: !peerStates[peerId].videoOn,
          });
        }
        if (m.data.includes("startScreenShare")) {
          const [, id] = m.data.split("-");
          updatePresenter(id);
        }
        switch (m.data) {
          case "camera-live":
            videoPaused = false;
            updatePeerStates(peerId, {
              ...peerStates[peerId],
              videoOn: !peerStates[peerId].videoOn,
            });
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
  <div class="border {small && 'small'}" bind:this={square}></div>
  <video
    class={small ? "video-small" : "video-normal"}
    bind:this={videoElement}
    style="display: {videoPaused ? 'none' : 'block'}"
    autoplay
    muted
  >
    <track kind="captions" />
  </video>

  <img
    src={pauseImage}
    class={small ? "small" : "large"}
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
  class="connecting centered {small && 'small-text'}"
  style="display: {initialized ? 'none' : 'flex'};{small && 'font-size: 10pt;'}"
>
  Connecting...
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

  .video-normal {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-small {
    width: 200px;
    max-height: 18vh;
    min-height: 125px;
    /* margin-right: 10px; */
    aspect-ratio: 4/3;
    object-fit: cover;
  }
  .small-text {
    font-size: 10pt;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
  }
  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
  }
  .small {
    width: 200px;
    object-fit: fill;
  }

  .large {
    object-fit: contain;
  }
</style>
