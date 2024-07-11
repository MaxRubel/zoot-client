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
  export let update_screen_sharer;

  let videoElement;
  let square;
  let presenting = false;
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
      } else {
        console.errpr("No video tracks found in remote stream");
      }
    } else {
      console.error("No remote streams or videoElement");
    }
  };
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
        isVideoSetup = true;
      }
      if (
        event.streams &&
        event.streams[0] &&
        event.track.kind === "video" &&
        !peerState?.initialized
      ) {
        videoElement.srcObject = event.streams[0];
      }
    };

    const unpackReport = (data) => {
      const [_, report] = data.split("&");
      const parsedObject = JSON.parse(report);

      if (parsedObject.sharing_screen) {
        update_screen_sharer(parsedObject.user_id);
      }

      updatePeerState(peerId, (currentState) => ({
        ...currentState,
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
            return;
        }
      };
    };
  });

  $: if (connection) {
    videoElement = videoElement;
  }
</script>

<div class="video-tile">
  <div class="border-gallery" bind:this={square}></div>
  <div class="media-container">
    <video
      class="media-content video-normal"
      class:fade-out={!peerState?.videoOn}
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    >
      <track kind="captions" />
    </video>
    <img
      src={peerState?.pauseImage}
      class="media-content pause-image"
      class:fade-out={peerState?.videoOn}
      alt=""
      style="display: {peerState?.initialized ? 'block' : 'none'}"
    />
    <div
      class="connecting centered"
      style="display: {peerState?.initialized ? 'none' : 'flex'}"
    >
      Connecting...
    </div>
  </div>
  <div
    class="mic-symbol"
    style="display: {!peerState?.audioOn ? 'block' : 'none'}"
  >
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
    height: 100%;
    width: 100%;
    top: 0;
    z-index: 10;
  }

  .media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .media-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-normal {
    opacity: 1;
    transition: opacity 0.5s ease-in;
    z-index: 5;
  }

  .pause-image {
    opacity: 1;
    transition: opacity 0.5s ease-out;
    z-index: 1;
  }

  .fade-out {
    opacity: 0;
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
    bottom: 10px;
    left: 10px;
  }

  .centered {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
