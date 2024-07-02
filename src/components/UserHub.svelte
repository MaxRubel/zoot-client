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
  import { screenShareOn } from "../../utils/media/screenShareOn";
  import ShareScreen from "../assets/ShareScreen.svelte";
  import ConfirmAudio from "./modals/ConfirmAudioModal.svelte";
  import ConfirmAudioModal from "./modals/ConfirmAudioModal.svelte";
  import { getAudioContext } from "../../stores/media/audioContext";
  import { createAudioContext } from "../../stores/media/audioContext";
  import BackIcon from "../assets/BackIcon.svelte";
  import SettingsSideways from "./menus/SettingsSideways.svelte";
  import { broadcastToRoom } from "../../utils/dataChannels/broadcastToRoom";

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
  let confirmAudio = false;
  let audioContext = getAudioContext();
  let dataChannels = {};

  if (!audioContext) {
    confirmAudio = true;
  }

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

  // const ws = new WebSocket(import.meta.env.VITE_PUBLIC_WS);
  const ws = new WebSocket(import.meta.env.VITE_LOCAL_WS);

  const cleanup = () => {
    ws.send(`3&${roomId}&${myId}&&`);
    Object.values(peerConnections).forEach((conn) => {
      if (peerConnections[conn]) {
        peerConnections[conn].close();
      }
    });
    Object.values(dataChannels).forEach((chan) => {
      chan.close();
    });
    ws.close();
  };
  window.addEventListener("beforeunload", (e) => {
    cleanup();
  });

  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
  };

  onDestroy(() => {
    ws.send(`3&${roomId}&${myId}&&`);
  });

  //Send My Id to Server When Connecting
  ws.onopen = () => {
    ws.send(`1&${roomId}&${myId}&0&`);
  };
  // console.log("hi");
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

    //Create New data channel from direct communication
    const dataChannel = peerConnection.createDataChannel(
      `dataChannel-${answererId}`,
    );

    dataChannels[answererId] = dataChannel;

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
      const filtered = e.data.replace("0", "");
      console.warn(filtered);
      return;
    }

    // Receive Array of Peer Ids Upon Joining
    if (dataType === "4") {
      joined = false;
      const clientArr = e.data.split("&");
      peers = addPeersToLocal(peers, myId, clientArr);
      if (audioContext) {
        init();
      }
      return;
    }

    if (dataType === "5") {
      const [_, peerId] = e.data.split("&");
      if (!peerId) {
        return;
      }
      peerConnections[peerId].close();
      dataChannels[peerId].close();
      delete peerConnections[peerId];
      delete dataChannels[peerId];
      peerConnections = { ...peerConnections };
      dataChannels = { ...dataChannels };
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

      //Create new data channel for direct communication
      const dataChannel = peerConnection.createDataChannel(
        `dataChannel-${senderId}`,
      );

      dataChannels[senderId] = dataChannel;

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
      localVideo.srcObject = await cameraOff(peerConnections);
      broadcastToRoom(dataChannels, "muted");
      videoOn = false;
    } else {
      localVideo.srcObject = await cameraOn(peerConnections);
      broadcastToRoom(dataChannels, "live");
      videoOn = true;
    }
  };

  const handleScreenShare = () => {
    screenShareOn(peerConnections);
  };

  const testMedia = () => {
    testIncomingMedia(peerConnections);
  };

  const closeModal = () => {
    cleanup();
    navigate("/");
  };

  const hookUpAudioContext = () => {
    createAudioContext();
    confirmAudio = false;
    init();
  };

  const showPeerConnections = () => {
    console.log(peerConnections);
  };

  const leaveRoom = () => {
    navigate("/");
  };
</script>

<div class="user-hub">
  <ConfirmAudioModal {confirmAudio} {closeModal} {hookUpAudioContext} />
  <SettingsSideways
    {sendTestMessage}
    {testConnection}
    {testMedia}
    {showPeerConnections}
  />

  <div class="top">
    <div id="video-container" class="top">
      <video id="localVideo" autoplay>
        <track kind="captions" />
      </video>
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerVideo {connection} />
      {/each}
    </div>
  </div>
  <div class="bottom">
    <div id="marginLeft" />
    <div class="mid-bottom">
      <button class="clear" on:click={handleMic}>
        {#if audioOn}
          <MicIcon />Mute Mic
        {:else}
          <MicOff />Activate Mic
        {/if}
      </button>
      <button class="clear" on:click={handleCamera}>
        {#if videoOn}
          <CameraOn />Stop Video
        {:else}
          <CameraOff />Start Video
        {/if}
      </button>
      <button class="clear" on:click={handleScreenShare}>
        <ShareScreen />Share Screen
      </button>
    </div>
    <div>
      <a href="/"><button class="clear red"><BackIcon />Leave Room</button></a>
    </div>
  </div>
</div>

<style>
  .top {
    margin-top: 10px;
  }

  #video-container {
    background-color: transparent;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 5px;
    padding: 0px 3px;
    margin-bottom: 80px;
    /* border: 1px solid rgb(68, 68, 68); */
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
    /* aspect-ratio: 4 / 3; */
  }

  .clear {
    display: flex;
    height: 90px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    background-color: rgb(24, 59, 90, 0.7);
    color: rgb(255, 255, 255);
  }

  .red {
    background-color: rgb(79, 0, 0, 0.7);
    border: none;
  }

  .bottom {
    border-top: 1px solid rgb(26, 26, 26);
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    padding: 10px;
    position: fixed;
    bottom: 0;
    left: 0;
    height: 110px;
    width: 100vw;
    min-width: 350px;
  }

  .mid-bottom {
    display: flex;
    justify-content: center;
  }
</style>
