<script>
  // @ts-nocheck

  import { onDestroy, onMount, tick } from "svelte";
  import { clientId } from "../../../stores/auth_store";
  import { checkPeerConnection } from "../../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../../utils/hub/testAndPrint";
  import { testIncomingMedia } from "../../../utils/hub/testMedia";
  import { addPeersToLocal } from "../../../utils/hub/addClientsToLocal";
  import MicIcon from "../../assets/MicIcon.svelte";
  import CameraOn from "../../assets/CameraOn.svelte";
  import MicOff from "../../assets/MicOff.svelte";
  import CameraOff from "../../assets/CameraOff.svelte";
  import { navigate } from "svelte-routing";
  import { micOn } from "../../../utils/media/micOn";
  import { micOff } from "../../../utils/media/micOff";
  import { cameraOn } from "../../../utils/media/cameraOn";
  import { cameraOff } from "../../../utils/media/cameraOff";
  import { screenShareOn } from "../../../utils/media/screenShareOn";
  import ShareScreen from "../../assets/ShareScreen.svelte";
  import ConfirmAudio from "../modals/ConfirmAudioModal.svelte";
  import ConfirmAudioModal from "../modals/ConfirmAudioModal.svelte";
  import {
    audioContextStore,
    getAudioContext,
  } from "../../../stores/media/audioContext";
  import { createAudioContext } from "../../../stores/media/audioContext";
  import BackIcon from "../../assets/BackIcon.svelte";
  import DebugMenu from "../menus/DebugMenu.svelte";
  import { broadcastToRoom } from "../../../utils/dataChannels/broadcastToRoom";
  import { chooseGif } from "../../../utils/media/chooseGif";
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import BottomToolBar from "../menus/BottomToolBar.svelte";
  import {
    userSelection,
    updateUserSelection,
  } from "../../../stores/media/mediaSelection";
  import { updateUserState, userState } from "../../../stores/media/userState";
  import UserPreferenceMenu from "../menus/UserPreferenceMenu.svelte";
  import PresenterView from "./SpeakerView.svelte";
  import {
    analyzeAudioLevels,
    stopAnalyzingAudioLevels,
  } from "../../../utils/media/analyzeAudioLevels";
  import ViewRooms from "./ViewRooms.svelte";
  import GalleryView from "./GalleryView.svelte";
  import SpeakerView from "./SpeakerView.svelte";
  import {
    clearPeerStates,
    deletePeerState,
  } from "../../../stores/media/peerStates";
  import ScreenShareView from "./ScreenShareView.svelte";
  import {
    dataChannelsStore,
    peerConnectionsStore,
    removeDataChannel,
    removePeerConnection,
    updateDataChannelStore,
    updatePeerConnectionStore,
  } from "../../../stores/media/roomStore";
  import { fade } from "svelte/transition";

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const param = url.pathname.split("/").pop();

  let audioContext;

  let roomId = param;
  let localVideo;
  let stream;
  let peerIDs = [];
  let peerConnections = {};
  let peerStates = {};
  let dataChannels = {};
  let confirmAudio = false;
  let myId;
  let user_state = {};
  let screen_sharer_id = null;

  //Audio Context Modal
  if (!audioContext) {
    confirmAudio = true;
  }

  //----Svelte Stores-----

  const unsubscribe = peerConnectionsStore.subscribe((value) => {
    peerConnections = value;
  });

  const unsubscribe1 = dataChannelsStore.subscribe((value) => {
    dataChannels = value;
  });

  //userId
  const unsubscribe2 = clientId.subscribe((value) => {
    myId = value;
  });

  const unsubscribe3 = userState.subscribe((value) => {
    user_state = value;
  });

  const unsubscribe4 = audioContextStore.subscribe((value) => {
    audioContext = value;
  });

  onDestroy(() => {
    peerConnectionsStore.set({});
    dataChannelsStore.set({});
    unsubscribe();
    unsubscribe1();
    unsubscribe2();
    unsubscribe3();
    unsubscribe4();
    broadcastToRoom(dataChannels, "I am leaving");
    clearPeerStates();
    // ws.send(`0&${roomId}&${myId}&&`);
    // ws.send(`3&${roomId}&${myId}&&`);
    stopAnalyzingAudioLevels();
    updateUserState("sharing_screen", null);
  });

  // window.addEventListener("resize", (e) => {
  // });

  const alignUserSelection = () => {
    user_state.audioOn
      ? micOn(peerConnections, stream)
      : micOff(peerConnections, stream);
    user_state.videoOn ? cameraOn(peerConnections) : cameraOff(peerConnections);
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
  let ws;
  try {
    ws = new WebSocket(import.meta.env.VITE_LOCAL_WS);
  } catch {
    console.error("Unable to connect to websocket");
  }

  const cleanup = () => {
    if (user_state.sharing_screen) {
      broadcastToRoom(dataChannels, "endscreenshare");
      updateUserState("sharing_screen", null);
    }

    ws.send(`3&${roomId}&${myId}&&`);
    ws.close();

    Object.values(peerConnections).forEach((conn) => {
      if (peerConnections[conn]) {
        peerConnections[conn].close();
      }
    });
    Object.values(dataChannels).forEach((chan) => {
      chan.close();
    });
  };
  window.addEventListener("beforeunload", (e) => {
    cleanup();
  });

  // history.pushState(null, null, location.href);
  // window.onpopstate = function () {
  //   history.go(1);
  // };

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

  const init = () => {
    if (peerIDs.length === 0) {
      return;
    }
    for (let i = 0; i < peerIDs.length; i++) {
      if (!checkPeerConnection(peerConnections, peerIDs[i], myId)) {
        startNegotiations(peerIDs[i]);
      }
    }
  };

  onMount(async () => {
    localVideo = await cameraOn(peerConnections);
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
    updatePeerConnectionStore(answererId, peerConnection);
    // peerConnections[answererId] = peerConnection;

    //Create New data channel from direct communication
    const dataChannel = peerConnection.createDataChannel(
      `dataChannel-${answererId}`,
    );

    updateDataChannelStore(answererId, dataChannel);
    // dataChannels[answererId] = dataChannel;
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
      audioOn: user_state.audioOn,
      videoOn: user_state.videoOn,
      sharing_screen: user_state.sharing_screen != null,
      user_id: myId,
      pauseImag: user_state.pauseImage,
    });

    //Send status report to new connection
    peerConnection.addEventListener("iceconnectionstatechange", (e) => {
      if (peerConnection.iceConnectionState === "connected") {
        alignUserSelection();
        dataChannel.addEventListener(
          "open",
          () => {
            dataChannel.send(`report&${report}`);
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
      const clientArr = e.data.split("&");
      peerIDs = addPeersToLocal(peerIDs, myId, clientArr);
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
      removePeerConnection(peerId);
      // delete peerConnections[peerId];
      removeDataChannel(peerId);
      // delete dataChannels[peerId];
      deletePeerState(peerId);
      // peerConnections = { ...peerConnections };
      // dataChannels = { ...dataChannels };
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
        updatePeerConnectionStore(
          senderId,
          new RTCPeerConnection({ iceServers }),
        );
        // peerConnections[senderId] = new RTCPeerConnection({ iceServers });
      }

      const peerConnection = peerConnections[senderId];

      //Create new data channel for direct communication
      const dataChannel = peerConnection.createDataChannel(
        `dataChannel-${senderId}`,
      );

      dataChannels[senderId] = dataChannel;

      const report = JSON.stringify({
        audioOn: user_state.audioOn,
        videoOn: user_state.videoOn,
        sharing_screen: user_state.sharing_screen,
        user_id: myId,
        pauseImage: user_state.pauseImage,
      });

      //Send status report to new connection
      peerConnection.addEventListener("iceconnectionstatechange", (e) => {
        if (peerConnection.iceConnectionState === "connected") {
          alignUserSelection();
          dataChannel.addEventListener(
            "open",
            () => {
              dataChannel.send(`report&${report}`);
              if (user_state.audioOn) {
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
          if (track.kind === "video") {
            if (user_state.sharing_screen) {
              peerConnection.addTrack(user_state.sharing_screen, stream);
            } else {
              peerConnection.addTrack(track, stream);
            }
          } else if (track.kind === "audio") {
            peerConnection.addTrack(track, stream);
          }
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
    if (user_state.audioOn) {
      micOff(peerConnections, stream);
      broadcastToRoom(dataChannels, "mic-muted");
    } else {
      micOn(peerConnections, stream);
      broadcastToRoom(dataChannels, "mic-live");
    }
  };

  const handleCamera = async () => {
    if (user_state.videoOn) {
      localVideo = await cameraOff(peerConnections);
      broadcastToRoom(dataChannels, `cameramuted-${user_state.pauseImage}`);
    } else {
      localVideo = await cameraOn(peerConnections);
      broadcastToRoom(dataChannels, "camera-live");
    }
  };

  const broadcast_end_screenshare = () => {
    broadcastToRoom(dataChannels, "endscreenshare");
  };

  const handleScreenShare = async () => {
    if (screen_sharer_id) {
      screen_sharer_id === myId
        ? console.warn("You are already presenting")
        : console.warn("someone else is already presenting");
      return;
    }

    screen_sharer_id = await screenShareOn(
      peerConnections,
      dataChannels,
      myId,
      screen_sharer_id,
      broadcast_end_screenshare,
      update_screen_sharer,
    );
  };

  const update_screen_sharer = (value) => {
    screen_sharer_id = value;
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
</script>

<div class="user-hub" transition:fade>
  <ConfirmAudioModal {confirmAudio} {closeModal} {hookUpAudioContext} />
  <UserPreferenceMenu />
  {#if user_state.debug}
    <DebugMenu
      {sendTestMessage}
      {testConnection}
      {testMedia}
      {showPeerConnections}
    />
  {/if}
  {#if screen_sharer_id}
    <ScreenShareView
      {peerConnections}
      {localVideo}
      {myId}
      {screen_sharer_id}
      {update_screen_sharer}
    />
  {:else if user_state.view === "speaker"}
    <SpeakerView {peerConnections} {localVideo} {myId} {update_screen_sharer} />
  {:else}
    <GalleryView {peerConnections} {localVideo} {update_screen_sharer} />
  {/if}
  <BottomToolBar {handleCamera} {handleMic} {handleScreenShare} />
</div>
