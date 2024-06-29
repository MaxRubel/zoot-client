<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../utils/hub/testAndPrint";
  import { testIncomingMedia } from "../../utils/hub/testMedia";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerVideo from "./PeerVideo.svelte";
  import MicIcon from "../assets/MicIcon.svelte";
  import CameraOn from "../assets/CameraOn.svelte";
  import MicOff from "../assets/MicOff.svelte";
  import CameraOff from "../assets/CameraOff.svelte";
  import { navigate } from "svelte-routing";
  import { micOn } from "../../utils/media/micOn";
  import { micOff } from "../../utils/media/micOff";
  import { cameraOn } from "../../utils/media/cameraOn";
  import { cameraOff } from "../../utils/media/cameraOff";

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const param = url.pathname.split("/").pop();

  let roomId = param;
  let videoStream;
  let localVideo;
  let audioElement;
  let peers = [];
  let peerConnections = {};
  let joined = false;
  let videoOn = true;
  let audioOn = true;
  let audioContext;

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" },
  ];

  let myId;

  clientId.subscribe((value) => {
    myId = value;
  });

  //public:
  // const ws = new WebSocket("wss://zoot-server-tgsls4olia-uc.a.run.app/ws");
  //local:
  const ws = new WebSocket("ws://localhost:8080/ws");

  const cleanup = () => {
    ws.send(`3&${roomId}&${myId}&&`);
    Object.values(peerConnections).forEach((conn) => {
      peerConnections[conn].close();
    });
    ws.close();
  };
  window.addEventListener("beforeunload", () => {
    cleanup();
  });
  window.addEventListener("popstate", () => {
    cleanup();
  });

  window.history.pushState(null, "", window.location.href);
  window.onpopstate = function (e) {
    cleanup();
  };

  onDestroy(() => {
    ws.send(`3&${roomId}&&&`);
  });

  //Send My Id to Server When Connecting
  ws.onopen = () => {
    ws.send(`1&${roomId}&${myId}&0&`);
  };

  ws.onerror = function (event) {
    console.error("WebSocket error:", event);
  };

  ws.onclose = () => {
    ws.send(`3&${roomId}&${myId}&&`);
  };

  const sendTestMessage = () => {
    ws.send(`0&${roomId}&${myId}&0&`);
  };

  async function getUserMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return stream;
  }

  const init = () => {
    if (peers.length === 0) {
      return;
    }
    for (let i = 0; i < peers.length; i++) {
      if (!checkPeerConnection(peerConnections, peers[i], myId)) {
        startNegotiations(peers[i]);
      }
    }
  };

  onMount(async () => {
    localVideo = document.getElementById("localVideo");
    audioElement = document.getElementById("audio");
    videoStream = await cameraOn(peerConnections);
    localVideo.srcObject = videoStream;
    micOn(peerConnections);
  });

  const startNegotiations = async (answererId) => {
    //Create New Peer Connection
    const peerConnection = new RTCPeerConnection({ iceServers });

    peerConnections[answererId] = peerConnection;

    //Get User's Media Stream
    const stream = await getUserMedia();

    //Get Each Track from the Stream
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    //Create Offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    //Send Offer
    ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(offer)}`);

    // Send the Ice Candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const data = {
          type: "iceCandidate",
          candidate: event.candidate,
        };
        if (peerConnection.localDescription) {
          ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(data)}`);
        }
      }
    };
  };

  ws.onmessage = async (e) => {
    const dataType = e.data[0];
    //Ping Server - Test
    if (dataType === "0") {
      console.log(e.data);
      return;
    }

    // Receive Array of Peer Ids Upon Joining
    if (dataType === "4") {
      joined = false;
      const clientArr = e.data.split("&");
      peers = addPeersToLocal(peers, myId, clientArr);
      init();
      return;
    }

    if (dataType === "5") {
      const [_, peerId] = e.data.split("&");
      if (!peerConnections[peerId]) {
        return;
      }
      peerConnections[peerId].close();
      delete peerConnections[peerId];
      peerConnections = peerConnections;
    }
    if (dataType === "6") {
      navigate("/rooms/new");
    }

    //---------------Negotiations----------------
    if (dataType === "3") {
      const [_, roomId, senderId, receiverId, data] = e.data.split("&");

      //Message Not For Me
      if (senderId === myId || receiverId !== myId) {
        return;
      }

      const parsed = JSON.parse(data);

      //Receiver Creates New Peer Connection
      if (!peerConnections[senderId]) {
        peerConnections[senderId] = new RTCPeerConnection({ iceServers });
      }

      const peerConnection = peerConnections[senderId];

      // Ice Candidates
      if (parsed.type === "iceCandidate") {
        await peerConnection.addIceCandidate(parsed.candidate);
        return;
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const data = {
            type: "iceCandidate",
            candidate: event.candidate,
          };
          if (peerConnection.localDescription) {
            ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(data)}`);
          }
        }
      };

      // Receiver Makes Answer
      if (parsed.type === "offer") {
        if (peerConnection.remoteDescription) {
          return;
        }
        await peerConnection.setRemoteDescription(parsed);

        const stream = await getUserMedia();
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(answer)}`);
      }

      // Handling Final Answer
      if (parsed.type === "answer") {
        await peerConnection.setRemoteDescription(parsed);
        peerConnection.onicecandidate = function (event) {
          if (event.candidate) {
            const data = {
              type: "iceCandidate",
              candidate: event.candidate,
            };
            peerConnection.addIceCandidate(event.candidate);
          }
        };
      }
    }
  };

  const testConnection = () => {
    testAndPrint(peerConnections);
  };

  const handleMic = () => {
    if (audioOn) {
      micOff(peerConnections);
      audioOn = false;
    } else {
      micOn(peerConnections);
      audioOn = true;
    }
  };

  const handleCamera = async () => {
    if (videoOn) {
      cameraOff(peerConnections);
      localVideo.srcObject = null;
      videoOn = false;
    } else {
      localVideo.srcObject = await cameraOn(peerConnections);
      videoOn = true;
    }
  };

  const testMedia = () => {
    testIncomingMedia(peerConnections);
  };
</script>

<main>
  <button on:click={sendTestMessage}>Ping server</button>
  <button on:click={testConnection}>Connection Details</button>
  <button on:click={testMedia}>Test Media</button>

  <div class="top">
    <div class="tool-bar">
      <button class="mic" on:click={handleMic}>
        {#if audioOn}
          <MicIcon />Mute Mic
        {:else}
          <MicOff />Activate Mic
        {/if}
      </button>
      <button class="camera" on:click={handleCamera}>
        {#if videoOn}
          <CameraOn />Stop Video
        {:else}
          <CameraOff />Start Video
        {/if}
      </button>
    </div>
    <div id="video-container" class="top">
      <video id="localVideo" autoplay>
        <track kind="captions" />
      </video>
      {#each Object.values(peerConnections) as connection}
        <PeerVideo {connection} />
      {/each}
    </div>
    <audio id="audio" autoplay></audio>
  </div>
</main>

<style>
  .top {
    margin-top: 50px;
  }

  #video-container {
    background-color: rgb(46, 46, 46);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 5px;
    padding: 3px;
  }

  @media screen and (max-width: 600px) {
    #video-container {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (min-width: 601px) {
    #video-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  video {
    width: 100%;
    height: 100%;
    min-height: 250px;
    object-fit: cover;
  }

  .tool-bar {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 20px;
  }

  .mic,
  .camera {
    display: flex;
    height: 90px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    background-color: aliceblue;
    color: black;
  }
</style>
