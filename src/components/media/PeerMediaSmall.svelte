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
  import { broadcastToRoom } from "../../../utils/dataChannels/broadcastToRoom";
  import { updateUserState } from "../../../stores/media/userState";
  import { resend_screenshare } from "../../../utils/media/resendScreenShare";

  export let connection;
  export let peerId;
  export let iAmSpeaking;
  export let update_screen_sharer;
  export let screen_sharer_id;

  let videoElement;
  let square;
  let loudest;
  let isVideoSetup = false;
  let peerState;

  const unsubscribe = loudestPeer.subscribe((value) => {
    loudest = value;
  });

  const unsubscribe2 = peerStates.subscribe((value) => {
    if (value[peerId]) {
      peerState = value[peerId];
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
    const remoteStreams = connection.getRemoteStreams();

    if (remoteStreams.length > 0 && videoElement) {
      const videoTracks = remoteStreams[0].getVideoTracks();

      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];

        if (videoElement.srcObject) {
          videoElement.srcObject
            .getVideoTracks()
            .forEach((track) => videoElement.srcObject.removeTrack(track));
          videoElement.srcObject.addTrack(videoTrack);
        } else {
          videoElement.srcObject = new MediaStream([videoTrack]);
        }
        isVideoSetup = true;
      }
    }
  };

  // $: console.log(connection);
  // $: console.log(videoElement);
  // $: console.log(peerState?.initialized);
  // $: console.log(isVideoSetup);

  $: if (
    connection &&
    videoElement &&
    peerState?.initialized &&
    !isVideoSetup
  ) {
    reSetupVideo();
  }

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
    if (connection) {
      connection.ontrack = null;
      connection.ondatachannel = null;
    }
  });

  onMount(() => {
    const audioContext = getAudioContext();
    connection.ontrack = (event) => {
      if (event.track.kind === "audio") {
        const audioStream = new MediaStream([event.track]);
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(audioContext.destination);
      }
      if (
        event.streams &&
        event.streams[0] &&
        event.track.kind === "video" &&
        !peerState?.initialized
      ) {
        videoElement.srcObject = event.streams[0];
        isVideoSetup = true;
      }
    };

    const unpackReport = (data) => {
      const [_, report] = data.split("&");
      const parsedObject = JSON.parse(report);

      if (parsedObject.sharing_screen) {
        update_screen_sharer(parsedObject.user_id);
      }

      updatePeerState(peerId, (currentState) => ({
        ...parsedObject,
        initialized: true,
      }));
    };

    //receive data from peer:
    connection.ondatachannel = (e) => {
      e.channel.onmessage = (m) => {
        if (m.data.includes("report")) {
          unpackReport(m.data);
        }

        if (m.data.includes("cameramuted")) {
          const [, parsed] = m.data.split("-");
          updatePeerState(peerId, (currentState) => ({
            ...currentState,
            pauseImage: parsed,
            videoOn: false,
          }));
        }

        if (m.data.includes("startScreenShare")) {
          const [, id] = m.data.split("&");
          update_screen_sharer(id);
        }

        switch (m.data) {
          case "camera-live":
            updatePeerState(peerId, (currentState) => ({
              ...currentState,
              videoOn: true,
            }));
            break;
          case "mic-muted":
            updatePeerState(peerId, (currentState) => ({
              ...currentState,
              audioOn: false,
            }));
            break;
          case "mic-live":
            updatePeerState(peerId, (currentState) => ({
              ...currentState,
              audioOn: true,
            }));
            break;
          case "endscreenshare":
            update_screen_sharer(null);
            break;
        }
      };
    };
  });

  $: if (connection) {
    videoElement = videoElement;
  }
</script>

<div
  class="peer-media-square"
  style="height: {screen_sharer_id ? '70px' : '140px'};"
>
  <div class="border" bind:this={square}></div>
  <div class="media-container">
    <video
      class="video-normal"
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    >
      <track kind="captions" />
    </video>
    <img
      src={peerState?.pauseImage}
      class="pause-image"
      class:fade-out={peerState?.videoOn}
      style="display: {peerState?.initialized ? 'block' : 'none'}"
      alt=""
    />
    <div
      class="connecting centered"
      style="display: {peerState?.initialized ? 'none' : 'flex'}"
    >
      Connecting...
    </div>
  </div>
  <div
    class="mic-symbol centered"
    style="display: {!peerState?.audioOn ? 'block' : 'none'}"
  >
    <MicOffRed />
  </div>
</div>

<style>
  .peer-media-square {
    position: relative;
    aspect-ratio: 4/3;
    height: 140px;
  }

  .border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
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
    font-size: 14px;
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
    z-index: 5;
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    transition: opacity 0.5s ease-out;
  }

  .fade-out {
    opacity: 0;
  }
</style>
