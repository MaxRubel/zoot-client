<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../../stores/media/audioContext";
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";

  export let connection;
  export let peerId;
  export let iAmSpeaking;
  export let updatePeerStates;
  export let peerStates;

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

<div class="peer-media-square">
  <div class="border" bind:this={square}></div>
  <div class="media-container">
    <video
      class="video-normal"
      class:fade-out={videoPaused}
      bind:this={videoElement}
      autoplay
      muted
    >
      <track kind="captions" />
    </video>
    <img
      src={pauseImage}
      class="pause-image"
      class:fade-out={!videoPaused}
      alt=""
    />
  </div>
  <div
    class="mic-symbol centered"
    style="display: {micMuted ? 'block' : 'none'}"
  >
    <MicOffRed />
  </div>
</div>

<div
  class="connecting centered"
  style="display: {initialized ? 'none' : 'flex'}"
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

  .media-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .video-normal {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    transition: opacity 0.5s ease-in;
  }

  img {
    aspect-ratio: 4/3;
    position: absolute;
    top: 0;
    left: 0;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
    opacity: 1;
    transition: opacity 0.5s ease-out;
  }

  .fade-out {
    opacity: 0;
  }
</style>
