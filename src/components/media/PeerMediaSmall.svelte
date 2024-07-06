<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../../stores/media/audioContext";
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import { loudestPeer } from "../../../stores/media/audioContext";
  import {
    peerStates,
    updatePeerState,
  } from "../../../stores/media/peerStates";

  export let connection;
  export let peerId;
  export let iAmSpeaking;

  let videoElement;
  let square;
  let videoPaused = false;
  let micMuted = false;
  let presenting = false;
  let initialized = false;
  let pauseImage = "/relax2.webp";
  let loudest;
  let isVideoSetup = false;
  let peerState;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  const unsubscribe2 = peerStates.subscribe((value) => {
    if (value[peerId]) {
      peerState = value[peerId];
      micMuted = !peerState.audioOn;
      videoPaused = !peerState.videoOn;
      initialized = peerState.initialized;
      pauseImage = peerState.pauseImage;
    }
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

  const reSetupVideo = () => {
    const videoTrack = connection
      .getReceivers()
      .find((receiver) => receiver.track.kind === "video")?.track;
    if (videoTrack) {
      videoElement.srcObject = new MediaStream([videoTrack]);
      videoElement.autoplay = true;
    }
  };

  $: if (connection && videoElement && initialized && !isVideoSetup) {
    reSetupVideo();
  }

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
  });

  onMount(() => {
    const audioContext = getAudioContext();
    connection.ontrack = (event) => {
      if (event.track.kind === "audio") {
        const audioStream = new MediaStream([event.track]);
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(audioContext.destination);
        isVideoSetup = true;
      }
      if (
        event.streams &&
        event.streams[0] &&
        event.track.kind === "video" &&
        !initialized
      ) {
        videoElement.srcObject = event.streams[0];
      }
    };

    const unpackReport = (data) => {
      const [_, report] = data.split("-");
      const parsedObject = JSON.parse(report);
      parsedObject.initialized = true;
      updatePeerState(peerId, parsedObject);
    };

    //receive data from peer:
    connection.ondatachannel = (e) => {
      e.channel.onmessage = (m) => {
        if (m.data.includes("report")) {
          unpackReport(m.data);
        }
        if (m.data.includes("camera-muted")) {
          console.log("camera muted");
          const [, , parsed] = m.data.split("-");
          pauseImage = parsed;
          updatePeerState(peerId, {
            ...peerState,
            pauseImage: parsed,
            videoOn: false,
          });
        }
        if (m.data.includes("startScreenShare")) {
          const [, id] = m.data.split("-");
          updatePresenter(id);
        }
        switch (m.data) {
          case "camera-live":
            videoPaused = false;
            updatePeerState(peerId, {
              ...peerState,
              videoOn: true,
            });
            break;
          case "mic-muted":
            updatePeerState(peerId, {
              ...peerState,
              audioOn: false,
            });
            break;
          case "mic-live":
            updatePeerState(peerId, {
              ...peerState,
              audioOn: true,
            });
            break;
          case "stopScreenShare":
            updatePresenter(null);
            break;
        }
      };
    };
  });

  if (peerStates[peerId]?.initialized) {
    initialized = true;
  }

  $: if (connection) {
    videoElement = videoElement;
  }
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
      playsinline
    >
      <track kind="captions" />
    </video>
    <img
      src={pauseImage}
      class="pause-image"
      class:fade-out={!videoPaused}
      alt=""
    />
    <div
      class="connecting centered"
      style="display: {initialized ? 'none' : 'flex'}"
    >
      Connecting...
    </div>
  </div>
  <div
    class="mic-symbol centered"
    style="display: {micMuted ? 'block' : 'none'}"
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
    z-index: 3;
  }

  .connecting {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
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
    height: 100%;
    width: 200px;
    object-fit: cover;
    opacity: 1;
    transition: opacity 0.5s ease-in;
    z-index: 5;
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
