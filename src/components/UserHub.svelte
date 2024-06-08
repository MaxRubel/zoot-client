<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../utils/hub/testAndPrint";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerVideo from "./PeerVideo.svelte";
  import DummyVideo from "./DummyVideo.svelte";

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const param = url.pathname.split("/").pop();

  let pausedVid = false;
  let pausedAudio = true;
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

  const ws = new WebSocket("ws://localhost:8080/ws");

  window.addEventListener("beforeunload", () => {
    ws.send(`3&${roomId}&${myId}&&`);
    peerConnections.forEach((conn) => {
      peerConnections[conn].close();
    });
    ws.close();
  });

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

  const cameraOn = () => {
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
    pausedVid = false;
  };

  const cameraOff = () => {
    if (streamVid) {
      streamVid.getTracks().forEach((t) => (t.enabled = false));
      localVideo.srcObject = null;
      pausedVid = true;
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
  };

  const micOn = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (mediaStream) {
        streamAudio = mediaStream;
        audioElement.srcObject = streamAudio;
      })
      .catch(function (error) {
        console.error("Error accessing the microphone:", error);
      });
  };

  // const micOff = () => {
  //   if (streamAudio) {
  //     const tracks = streamAudio.getTracks();
  //     tracks.forEach(function (track) {
  //       track.stop();
  //     });
  //     audioElement.srcObject = null;
  //   }
  // };

  // const handlePauseVid = () => {
  //   pausedVid = !pausedVid;
  //   if (pausedVid) {
  //     cameraOff();
  //   } else {
  //     cameraOn();
  //   }
  // };

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
    console.log("init");
    peerConnections = {};
    if (peers.length === 0) {
      console.log("one one else in the room");
      return;
    }
    for (let i = 0; i < peers.length; i++) {
      if (!checkPeerConnection(peerConnections, peers[i], myId)) {
        console.log("initializing negotiation with client: ", i + 1);
        startNegotiations(peers[i]);
      }
    }
  };

  onMount(() => {
    pausedVid = true;
    pausedAudio = true;
    localVideo = document.getElementById("localVideo");
    remoteVideo = document.getElementById("remoteVideo");
    audioElement = document.getElementById("audio");
    cameraOn();
    init();
  });

  const startNegotiations = async (answererId) => {
    //CREATE CONNECTION OBJECT
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnections[answererId] = peerConnection;
    console.log("new peer connection created: ", peerConnection);

    //GET MEDIA
    const stream = await getUserMedia();
    stream.getTracks().forEach((track) => {
      console.log("track: ", track);
      peerConnection.addTrack(track, stream);
    });

    const offer = await peerConnection.createOffer();

    //CREATE OFFER
    console.log("created offer", offer);

    await peerConnection.setLocalDescription(offer);
    console.log("set local description:", offer);

    //SEND OFFER --
    ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(offer)}`);
    console.log("sent offer");

    // Send the ICE CANDIDATES to answerer
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const data = {
          type: "iceCandidate",
          candidate: event.candidate,
        };
        if (peerConnection.localDescription) {
          console.log("sending ice candidate from offerer: ", data);
          ws.send(`2&${roomId}&${myId}&${answererId}&${JSON.stringify(data)}`);
        }
      }
    };
    peerConnection.addEventListener("iceconnectionstatechange", () => {
      console.log("ICE Connection State:", peerConnection.iceConnectionState);
    });
  };

  ws.onmessage = async (e) => {
    const dataType = e.data[0];
    //TEST ping server
    if (dataType === "0") {
      console.log(e.data);
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
      console.log(`received ${parsed.type}`);

      //ANSWERER MAKES NEW PEER CONNECTION
      if (!peerConnections[senderId]) {
        peerConnections[senderId] = new RTCPeerConnection({ iceServers });
        console.log(
          "creating new peer connection: ",
          peerConnections[senderId],
        );
      }

      const peerConnection = peerConnections[senderId];

      // ICE CANDIDATES
      if (parsed.type === "iceCandidate") {
        console.log("receiving ice candidate: from ", senderId, parsed);

        await peerConnection.addIceCandidate(parsed.candidate);
        console.log("added ice candidate: ", parsed.candidate);
        console.log("candidate status: ", peerConnection.iceConnectionState);
        return;
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const data = {
            type: "iceCandidate",
            candidate: event.candidate,
          };
          if (peerConnection.localDescription) {
            console.log("sending ice candidate from answerer: ", data);
            ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(data)}`);
          }
        }
      };

      // ANSWERER MAKES ANSWER
      if (parsed.type === "offer") {
        if (peerConnection.remoteDescription) {
          console.log("this sender is already in the peer connections array:");
          return;
        }
        await peerConnection.setRemoteDescription(parsed);
        peerConnection.addEventListener("iceconnectionstatechange", () => {
          console.log(
            "ICE Connection State:",
            peerConnection.iceConnectionState,
          );
        });
        const stream = await getUserMedia();
        stream.getTracks().forEach((track) => {
          console.log("adding answer track: ", track);
          peerConnection.addTrack(track, stream);
        });
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        console.log("setting answer to local description");
        console.log("sending answer: ", answer);
        console.log(
          "finished negotiation, status: ",
          peerConnection.iceConnectionState,
        );

        ws.send(`2&${roomId}&${myId}&${senderId}&${JSON.stringify(answer)}`);
      }

      // Handling 'answer' message type -- END
      if (parsed.type === "answer") {
        await peerConnection.setRemoteDescription(parsed);
        console.log("setting answer to remote description");
        console.log("Finished negotiation!");
        console.log("candidate status: ", peerConnection.iceConnectionState);
        peerConnection.onicecandidate = function (event) {
          if (event.candidate) {
            const data = {
              type: "iceCandidate",
              candidate: event.candidate,
            };

            console.log("adding ice candidate: ", event.candidate);
            peerConnection.addIceCandidate(event.candidate);
          }
        };
      }
    }

    //receive array of peers upon JOINING
    if (dataType === "4") {
      joined = false;
      console.log("array of clients: ", e.data);
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
      console.log("deleting peer connection");
      peerConnections[peerId].close();
      delete peerConnections[peerId];
      peerConnections = peerConnections;
    }
  };

  const testConnection = () => {
    testAndPrint(peerConnections);
  };
  //   ws.send("5&&&");
  // };

  // const showMyId = () => {
  //   console.log(myId);
  // };

  const clearClients = () => {
    ws.send("4&&&&");
  };

  $: console.log("camera is paused: ", pausedVid);

  $: {
    console.log("future connections:", peers);
  }

  const showMyId = () => {
    console.log(myId);
  };
</script>

<main>
  <button on:click={sendTestMessage}>Ping server</button>
  <button on:click={init}>Connect with: {peers.length}</button>
  <button on:click={testConnection}>Connection Details</button>

  <div class="top">
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
    background-color: red;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
  }

  @media screen and (max-width: 600px) {
    #video-container {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (min-width: 601px) and (max-width: 900px) {
    #video-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
