<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../utils/hub/testAndPrint";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerVideo from "./PeerVideo.svelte";
  import DummyVideo from "./DummyVideo.svelte";
  import MicIcon from "../assets/MicIcon.svelte";
  import CameraOn from "../assets/CameraOn.svelte";
  import MicOff from "../assets/MicOff.svelte";
  import CameraOff from "../assets/CameraOff.svelte";
  import { navigate } from "svelte-routing";

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const param = url.pathname.split("/").pop();

  let streamVid;
  let streamAudio;
  let localVideo;
  let remoteVideo;
  let audioElement;
  let peers = [];
  let peerConnections = {};
  let dummyVidoes = [1];
  let joined = false;
  let roomId = param;
  let cameraOn = false;
  let audioOn = false;

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

  function setupAudioForPeer(peerIndex, stream) {
    // Get the audio track from the stream
    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) {
      console.error(`No audio track found for peer at index ${peerIndex}`);
      return;
    }

    // Create a MediaStreamSource
    const source = audioContext.createMediaStreamSource(
      new MediaStream([audioTrack]),
    );

    // Connect the source to the audio context's destination
    source.connect(audioContext.destination);

    // Store the source in the peer connection object for potential later use
    peerConnections[peerIndex].audioSource = source;
  }

  function handleNewAudio(peerId, stream) {
    const peerConnection = peerConnections[peerId];
    if (peerConnection) {
      peerConnection.stream = stream;
      setupAudioForPeer(peerIndex, stream);
    } else {
      console.error(`No peer connection found at with id ${peerId}`);
    }
  }

  //public:
  const ws = new WebSocket("wss://zoot-server-tgsls4olia-uc.a.run.app/ws");
  //local:
  // const ws = new WebSocket("ws://localhost:8080/ws");

  const cleanup = () => {
    ws.send(`3&${roomId}&${myId}&&`);
    peerConnections.forEach((conn) => {
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

  //SEND ID TO SERVER WHEN CONNECTING
  ws.onopen = () => {
    ws.send(`1&${roomId}&${myId}&0&`);
  };

  ws.onerror = function (event) {
    console.error("WebSocket error:", event);
  };

  let myId;

  clientId.subscribe((value) => {
    myId = value;
  });

  onDestroy(() => {
    ws.send(`3&${roomId}&&&`);
  });

  const turnOnCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        streamVid = mediaStream;
        localVideo.srcObject = streamVid;
        streamVid.getTracks().forEach((t) => (t.enabled = true));
      })
      .catch(function (error) {
        console.error("Error accessing the webcam:", error);
      });
    const connections = Object.values(peerConnections);
    connections.forEach((conn) => {
      const videoSender = conn.getSenders().find((s) => {
        return s.track?.kind === "video";
      });
      if (videoSender) {
        videoSender.track.enabled = true;
      }
    });
    cameraOn = true;
  };

  const cameraOff = () => {
    if (streamVid) {
      streamVid.getTracks().forEach((t) => (t.enabled = false));
      localVideo.srcObject = null;
      const connections = Object.values(peerConnections);
      connections.forEach((conn) => {
        const videoSender = conn.getSenders().find(function (s) {
          return s.track?.kind === "video";
        });
        if (videoSender) {
          videoSender.track.enabled = false;
        }
      });
    }
    cameraOn = false;
  };

  const micOn = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      .then((mediaStream) => {
        streamAudio = mediaStream;

        const audioTrack = mediaStream.getAudioTracks()[0];

        audioTrack.enabled = true;

        const connections = Object.values(peerConnections);
        connections.forEach((conn) => {
          const audioSender = conn
            .getSenders()
            .find((s) => s.track?.kind === "audio");
          if (audioSender) {
            audioSender.replaceTrack(audioTrack);
          } else {
            conn.addTrack(audioTrack, mediaStream);
          }
        });
      })
      .catch(function (error) {
        console.error("Error accessing the microphone:", error);
      });

    audioOn = true;
  };

  const micOff = () => {
    if (streamAudio) {
      const tracks = streamAudio.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      audioElement.srcObject = null;
    }
    const connections = Object.values(peerConnections);
    connections.forEach((conn) => {
      const audioSender = conn.getSenders().find(function (s) {
        return s.track?.kind === "audio";
      });
      if (audioSender) {
        audioSender.track.enabled = false;
      }
    });
    audioOn = false;
  };

  const sendTestMessage = () => {
    ws.send(`0&${roomId}&${myId}&0&`);
  };

  async function getUserMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  const init = () => {
    // console.log("init");
    peerConnections = {};
    if (peers.length === 0) {
      // console.log("one one else in the room");
      return;
    }
    for (let i = 0; i < peers.length; i++) {
      if (!checkPeerConnection(peerConnections, peers[i], myId)) {
        // console.log("initializing negotiation with client: ", i + 1);
        startNegotiations(peers[i]);
      }
    }
  };

  onMount(() => {
    localVideo = document.getElementById("localVideo");
    remoteVideo = document.getElementById("remoteVideo");
    audioElement = document.getElementById("audio");
    turnOnCamera();
    micOn();
    init();
  });

  const startNegotiations = async (answererId) => {
    //CREATE CONNECTION OBJECT
    const peerConnection = new RTCPeerConnection({ iceServers });

    peerConnections[answererId] = peerConnection;

    peerConnection.ontrack = (e) => {
      handleNewAudio(answererId, e.streams[0]);
    };
    // console.log("new peer connection created: ", peerConnection);

    //GET MEDIA
    const stream = await getUserMedia();
    stream.getTracks().forEach((track) => {
      // console.log("track: ", track);
      peerConnection.addTrack(track, stream);
    });
    const offer = await peerConnection.createOffer();

    //CREATE OFFER
    // console.log("created offer", offer);

    await peerConnection.setLocalDescription(offer);
    // console.log("set local description:", offer);

    //SEND OFFER --
    ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(offer)}`);
    // console.log("sent offer");

    // Send the ICE CANDIDATES to answerer
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const data = {
          type: "iceCandidate",
          candidate: event.candidate,
        };
        if (peerConnection.localDescription) {
          // console.log("sending ice candidate from offerer: ", data);
          ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(data)}`);
        }
      }
    };
    peerConnection.addEventListener("iceconnectionstatechange", () => {
      // console.log("ICE Connection State:", peerConnection.iceConnectionState);
    });
  };

  ws.onmessage = async (e) => {
    const dataType = e.data[0];
    //TEST ping server
    if (dataType === "0") {
      // console.log(e.data);
      return;
    }

    //NEGOTIATIONS
    if (dataType === "3") {
      const [_, roomId, senderId, receiverId, data] = e.data.split("&");

      //MESSAGE NOT FOR ME
      if (senderId === myId || receiverId !== myId) {
        return;
      }

      const parsed = JSON.parse(data);
      // console.log(`received ${parsed.type}`);

      //ANSWERER MAKES NEW PEER CONNECTION
      if (!peerConnections[senderId]) {
        peerConnections[senderId] = new RTCPeerConnection({ iceServers });
        // console.log(
        //   "creating new peer connection: ",
        //   peerConnections[senderId],
        // );
      }

      const peerConnection = peerConnections[senderId];

      // ICE CANDIDATES
      if (parsed.type === "iceCandidate") {
        // console.log("receiving ice candidate: from ", senderId, parsed);

        await peerConnection.addIceCandidate(parsed.candidate);
        // console.log("added ice candidate: ", parsed.candidate);
        // console.log("candidate status: ", peerConnection.iceConnectionState);
        return;
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const data = {
            type: "iceCandidate",
            candidate: event.candidate,
          };
          if (peerConnection.localDescription) {
            // console.log("sending ice candidate from answerer: ", data);
            ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(data)}`);
          }
        }
      };

      // ANSWERER MAKES ANSWER
      if (parsed.type === "offer") {
        if (peerConnection.remoteDescription) {
          // console.log("this sender is already in the peer connections array:");
          return;
        }
        await peerConnection.setRemoteDescription(parsed);
        peerConnection.addEventListener("iceconnectionstatechange", () => {
          // console.log(
          //   "ICE Connection State:",
          //   peerConnection.iceConnectionState,
          // );
        });
        const stream = await getUserMedia();
        stream.getTracks().forEach((track) => {
          // console.log("adding answer track: ", track);
          peerConnection.addTrack(track, stream);
        });
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        // console.log("setting answer to local description");
        // console.log("sending answer: ", answer);
        // console.log(
        //   "finished negotiation, status: ",
        //   peerConnection.iceConnectionState,
        // );

        ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(answer)}`);
      }

      // Handling 'answer' message type -- END
      if (parsed.type === "answer") {
        await peerConnection.setRemoteDescription(parsed);
        // console.log("setting answer to remote description");
        // console.log("Finished negotiation!");
        // console.log("candidate status: ", peerConnection.iceConnectionState);
        peerConnection.onicecandidate = function (event) {
          if (event.candidate) {
            const data = {
              type: "iceCandidate",
              candidate: event.candidate,
            };

            // console.log("adding ice candidate: ", event.candidate);
            peerConnection.addIceCandidate(event.candidate);
          }
        };
      }
    }

    //receive array of peers upon JOINING
    if (dataType === "4") {
      joined = false;
      // console.log("array of clients: ", e.data);
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
      // console.log("deleting peer connection");
      peerConnections[peerId].close();
      delete peerConnections[peerId];
      peerConnections = peerConnections;
    }
    if (dataType === "6") {
      navigate("/rooms/new");
    }
  };

  const testConnection = () => {
    testAndPrint(peerConnections);
  };

  const handleMic = () => {
    if (audioOn) {
      micOff();
    } else {
      micOn();
    }
  };

  const handleCamera = () => {
    if (cameraOn) {
      cameraOff();
    } else {
      turnOnCamera();
    }
  };
</script>

<main>
  <button on:click={sendTestMessage}>Ping server</button>
  <button on:click={testConnection}>Connection Details</button>

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
        {#if cameraOn}
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
