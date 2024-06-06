<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { testAndPrint } from "../../utils/hub/testAndPrint";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerVideo from "./PeerVideo.svelte";

  let pausedVid = false;
  let pausedAudio = true;
  let streamVid;
  let streamAudio;
  let localVideo;
  let remoteVideo;
  let audioElement;
  let peers = [];
  let peerConnections = {};
  let noOfConnections = 0;
  let joined = false;

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
    ws.send(`3&${myId}&&`);
    ws.close();
  });
  ws.onopen = () => {
    console.log("Connected to server");
    ws.send(`1&${myId}&0&`);
  };

  ws.onerror = function (event) {
    console.error("WebSocket error:", event);
  };

  let myId;

  clientId.subscribe((value) => {
    myId = value;
  });

  onMount(() => {
    pausedVid = true;
    pausedAudio = true;
    localVideo = document.getElementById("localVideo");
    remoteVideo = document.getElementById("remoteVideo");
    audioElement = document.getElementById("audio");
    cameraOn();
  });

  onDestroy(() => {
    ws.send("3&&&");
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
    ws.send(`0&${myId}&0&`);
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

  const startNegotiations = async (answererId) => {
    //create new peer connection
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnections[answererId] = peerConnection;
    console.log("new peer connection created: ", peerConnection);

    //get media
    const stream = await getUserMedia();
    stream.getTracks().forEach((track) => {
      console.log("track: ", track);
      peerConnection.addTrack(track, stream);
    });

    const offer = await peerConnection.createOffer();

    //create offer
    console.log("created offer", offer);

    await peerConnection.setLocalDescription(offer);
    console.log("set local description:", offer);

    //SEND IT -- OFFER --
    ws.send(`2&${myId}&${answererId}&${JSON.stringify(offer)}`);
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
          ws.send(`2&${myId}&${answererId}&${JSON.stringify(data)}`);
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
      const [_, senderId, receiverId, data] = e.data.split("&");

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
            ws.send(`2&${myId}&${senderId}&${JSON.stringify(data)}`);
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

        ws.send(`2&${myId}&${senderId}&${JSON.stringify(answer)}`);
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
      return;
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
    ws.send("4&&&");
  };

  $: console.log("camera is paused: ", pausedVid);

  $: {
    console.log("future connections:", peers);
  }

  $: noOfConnections = Object.values(peerConnections).length;

  const showMyId = () => {
    console.log(myId);
  };
</script>

<main>
  <button on:click={clearClients}>Refresh Server</button>
  <button on:click={sendTestMessage}>Ping server</button>
  <button on:click={init}>Connect {peers.length}</button>
  <button on:click={testConnection}>Connection Details</button>
  <button on:click={showMyId}>Show My Id</button>

  <div class="top">
    <video id="localVideo" width="160" height="120" autoplay>
      <track kind="captions" />
    </video>
    <div id="video-container" class="top">
      {#each Object.values(peerConnections) as connection}
        <PeerVideo {connection} />
      {/each}
    </div>
    <audio id="audio" autoplay></audio>
  </div>
  <div class="top">
    <!-- <button on:click={handlePauseVid}>
      {pausedVid ? "Turn On Camera" : "Turn Off Camera"}
    </button> -->
    <!-- <button on:click={handlePauseAudio}>
      {pausedAudio ? "Turn On Microphone" : "Turn Off Microphone"}
    </button> -->
  </div>
</main>

<style>
  .top {
    margin-top: 50px;
  }

  #video-container {
    display: flex;
    flex-wrap: wrap;
  }
</style>
