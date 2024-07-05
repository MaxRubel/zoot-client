<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../utils/hub/testAndPrint";
  import { testIncomingMedia } from "../../utils/hub/testMedia";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerMedia from "./PeerMedia.svelte";
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
  import {
    audioContextStore,
    getAudioContext,
  } from "../../stores/media/audioContext";
  import { createAudioContext } from "../../stores/media/audioContext";
  import BackIcon from "../assets/BackIcon.svelte";
  import DebugMenu from "./menus/DebugMenu.svelte";
  import { broadcastToRoom } from "../../utils/dataChannels/broadcastToRoom";
  import { chooseGif } from "../../utils/media/chooseGif";
  import MicOffRed from "../assets/MicOffRed.svelte";
  import BottomToolBar from "./menus/BottomToolBar.svelte";
  import {
    userSelection,
    updateUserSelection,
  } from "../../stores/media/mediaSelection";
  import {
    userPreferences,
    updateUserPreferences,
  } from "../../stores/media/userPreferences";
  import UserPreferenceMenu from "./menus/UserPreferenceMenu.svelte";
  import PresenterView from "./views/PresenterView.svelte";
  import {
    analyzeAudioLevels,
    stopAnalyzingAudioLevels,
  } from "../../utils/media/analyzeAudioLevels";

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const param = url.pathname.split("/").pop();

  let roomId = param;
  let videoStream;
  let localVideo;
  let peers = [];
  let peerConnections = {};
  let peerStates = {};
  let dataChannels = {};
  let joined = false;
  let presenting = false;
  let confirmAudio = false;
  let audioContext;
  let pauseImage = chooseGif();
  let videoOn;
  let audioOn;
  let myId;
  let userPrefs = {};
  let presenter = null;
  let stream = null;

  //Audio Context Modal
  if (!audioContext) {
    confirmAudio = true;
  }

  //Svelte Stores
  //whether your camera/audio was turned on last time
  const unsubscribe = userSelection.subscribe((value) => {
    audioOn = value.audioOn;
    videoOn = value.videoOn;
  });

  //userId
  const unsubscribe2 = clientId.subscribe((value) => {
    myId = value;
  });

  //
  const unsubscribe3 = userPreferences.subscribe((value) => {
    userPrefs = value;
  });

  const unsubscribe4 = audioContextStore.subscribe((value) => {
    audioContext = value;
  });

  onDestroy(unsubscribe, unsubscribe2, unsubscribe3, unsubscribe4);

  const alignUserSelection = () => {
    audioOn ? micOn(peerConnections, stream) : micOff(peerConnections, stream);
    videoOn ? cameraOn(peerConnections) : cameraOff(peerConnections);
  };

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
    stopAnalyzingAudioLevels();
    unsubscribe();
    unsubscribe2();
    unsubscribe3();
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
    const fetchedStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    return fetchedStream;
  }

  async function initStream() {
    stream = await getUserMedia();
  }

  $: {
    if (!stream) {
      initStream();
    }
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
    videoStream = await cameraOn(peerConnections);
    localVideo.srcObject = videoStream;
    stream = await getUserMedia();
  });

  //analyze audio levels:
  $: {
    stopAnalyzingAudioLevels();
    analyzeAudioLevels(peerConnections, stream, myId, audioContext);
  }

  const startNegotiations = async (answererId) => {
    //Create New Peer Connection
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnections[answererId] = peerConnection;

    //Create New data channel from direct communication
    const dataChannel = peerConnection.createDataChannel(
      `dataChannel-${answererId}`,
    );

    dataChannels[answererId] = dataChannel;
    //Get Each Track from the Stream

    stream = await getUserMedia();
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    //Create Offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    //Send status report after joining
    const report = JSON.stringify({
      audioOn,
      videoOn,
      presenting,
      pauseImage,
    });

    //Send status report to new connection
    peerConnection.addEventListener("iceconnectionstatechange", (e) => {
      if (peerConnection.iceConnectionState === "connected") {
        alignUserSelection();
        dataChannel.addEventListener(
          "open",
          () => {
            dataChannel.send(`report-${report}`);
          },
          { once: true },
        );
      }
    });

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

      const report = JSON.stringify({
        audioOn,
        videoOn,
        presenting,
        pauseImage,
      });

      //Send status report to new connection
      peerConnection.addEventListener("iceconnectionstatechange", (e) => {
        if (peerConnection.iceConnectionState === "connected") {
          alignUserSelection();
          dataChannel.addEventListener(
            "open",
            () => {
              dataChannel.send(`report-${report}`);
              if (audioOn) {
                micOn(peerConnections, stream);
              } else {
                micOff(peerConnections, stream);
              }
            },
            { once: true },
          );
        }
      });

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
        stream = await getUserMedia();
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
      micOff(peerConnections, stream);
      broadcastToRoom(dataChannels, "mic-muted");
      audioOn = false;
      updateUserSelection(audioOn, videoOn);
    } else {
      micOn(peerConnections, stream);
      broadcastToRoom(dataChannels, "mic-live");
      audioOn = true;
      updateUserSelection(audioOn, videoOn);
    }
  };

  const handleCamera = async () => {
    if (videoOn) {
      localVideo.srcObject = await cameraOff(peerConnections);
      pauseImage = chooseGif();
      broadcastToRoom(dataChannels, `camera-muted-${pauseImage}`);
      videoOn = false;
      updateUserSelection(audioOn, videoOn);
    } else {
      localVideo.srcObject = await cameraOn(peerConnections);
      broadcastToRoom(dataChannels, "camera-live");
      videoOn = true;
      updateUserSelection(audioOn, videoOn);
    }
  };

  const handleScreenShare = () => {
    if (presenter) {
      window.alert("Oops! Somone is already presenting.");
      return;
    }
    presenter = myId;
    screenShareOn(peerConnections, dataChannels, myId);
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
  const updateUserPrefs = (userPrefs) => {
    updateUserPreferences(userPrefs);
  };

  const updatePresenter = (value) => {
    presenter = value;
  };

  const updatePeerStates = (id, value) => {
    peerStates[id] = value;
    peerStates = { ...peerStates };
  };
</script>

<div class="user-hub">
  <ConfirmAudioModal {confirmAudio} {closeModal} {hookUpAudioContext} />
  <!-- <DebugMenu
    {sendTestMessage}
    {testConnection}
    {testMedia}
    {showPeerConnections}
  /> -->
  <UserPreferenceMenu {userPrefs} {presenter} />
  <PresenterView
    {peerConnections}
    {audioOn}
    {videoOn}
    {userPrefs}
    {pauseImage}
    {updatePeerStates}
    {peerStates}
  />
  <!-- <div class="top">
    <div id="video-container" class="top">
      <div
        class="local-video"
        style="display: {userPrefs.hideSelf ? 'none' : 'block'};"
      >
        <img
          class="paused-image"
          src={pauseImage}
          alt="Camera Paused..."
          style="display: {videoOn ? 'none' : 'block'};"
        />
        <video
          id="localVideo"
          autoplay
          style="display: {videoOn ? 'block' : 'none'};"
        >
          <track kind="captions" />
        </video>
        <div
          class="mic-symbol centered"
          style="display: {audioOn ? 'none' : 'block'}"
        >
          <MicOffRed />
        </div>
      </div>

      {#if presenter}
        <PresenterView {peerConnections} {updatePresenter} {presenter} />
      {:else}
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMedia {connection} {peerId} {updatePresenter} />
      {/each}
      {/if}
    </div>
  </div> -->
  <BottomToolBar
    {audioOn}
    {videoOn}
    {handleCamera}
    {handleMic}
    {handleScreenShare}
  />
</div>

<style>
  /* .top {
    margin-top: 10px;
  }

  .local-video {
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

  #video-container {
    background-color: transparent;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 5px;
    padding: 0px 3px;
    margin-bottom: 80px;
    /* border: 1px solid rgb(68, 68, 68); */
  /* } */

  /* @media screen and (max-width: 600px) {
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

  .paused-image {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    object-fit: fill;
  }  */
</style>
