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

  const micOff = () => {
    if (streamAudio) {
      const tracks = streamAudio.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      audioElement.srcObject = null;
    }
  };

  const handlePauseVid = () => {
    pausedVid = !pausedVid;
    if (pausedVid) {
      cameraOff();
    } else {
      cameraOn();
    }
  };

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
    for (let i = 0; i < peers.length; i++) {
      if (!checkPeerConnection(peerConnections, peers[i], myId)) {
        console.log("initializing negotiation with client: ", i + 1);
        startNegotiations(peers[i]);
      }
    }
  };
  const startNegotiations = async (peerId) => {
    try {
      const peerConnection = new RTCPeerConnection();
      peerConnections[peerId] = peerConnection;

      const stream = await getUserMedia();
      console.log("stream: ", stream);
      stream.getTracks().forEach((track) => {
        console.log("track: ", track);
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const data = {
            type: "iceCandidate",
            candidate: event.candidate,
          };
          console.log("sending ice candidate: ", data);
          ws.send(`2&${myId}&${peerId}&${JSON.stringify(data)}`);
        }
      };

      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToSendVideo: true,
      });

      console.log("created offer", offer);

      await peerConnection.setLocalDescription(offer);
      console.log("set local description");

      ws.send(`2&${myId}&${peerId}&${JSON.stringify(offer)}`);
      console.log("sent offer");
    } catch (error) {
      console.error("Error during negotiation: ", error);
    }
  };

  ws.onmessage = async (e) => {
    if (e.data[0] === "0") {
      console.log(e.data);
    }

    if (e.data[0] === "4") {
      joined = false;
      console.log("array of clients: ", e.data);
      const clientArr = e.data.split("&");
      peers = addPeersToLocal(peers, myId, clientArr);
    }

    if (e.data[0] === "3") {
      const [_, senderId, receiverId, data] = e.data.split("&");

      const parsed = JSON.parse(data);

      if (senderId === myId) {
        return;
      }

      if (receiverId !== myId) {
        return;
      }

      console.log(`receiving a ${parsed.type}`);

      // Ensure peerConnections object is initialized
      if (!peerConnections[senderId]) {
        console.log("creating new peer connection:");
        peerConnections[senderId] = new RTCPeerConnection();
      }

      const peerConnection = peerConnections[senderId];

      // Handling 'offer' message type
      if (parsed.type === "offer") {
        if (peerConnection.remoteDescription) {
          console.log("this sender is already in the peer connections array:");
        } else {
          peerConnection.setRemoteDescription(parsed);
          const stream = await getUserMedia();
          console.log("answer stream: ", stream);
          stream.getTracks().forEach((track) => {
            console.log("answer track: ", track);
            peerConnection.addTrack(track, stream);
          });
          const answer = await peerConnection.createAnswer();
          peerConnection.setLocalDescription(answer);
          console.log("sending answer: ", answer);
          ws.send(`2&${myId}&${senderId}&${JSON.stringify(answer)}`);
        }
      }

      // Handling 'answer' message type
      if (parsed.type === "answer") {
        if (peerConnection.remoteDescription) {
        } else {
          peerConnection.setRemoteDescription(parsed);
          console.log("I was the last to receive data!");
        }
      }

      // Handling 'iceCandidate' message type
      if (parsed.type === "iceCandidate") {
        console.log("receiving ice candidate: ", parsed);
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(parsed.candidate).then(() => {
            console.log("added ice candidate--success");
            // cameraOn();
          });
        }
      }
    }
  };

  const testConnection = () => {
    testAndPrint(peerConnections);
  };

  const getServerIds = () => {
    ws.send("5&&&");
  };

  const showMyId = () => {
    console.log(myId);
  };

  const clearClients = () => {
    ws.send("4&&&");
  };

  $: console.log("camera is paused: ", pausedVid);

  $: {
    console.log("need to connect to:", peers);
  }

  $: noOfConnections = Object.values(peerConnections).length;
</script>

<main>
  <button on:click={sendTestMessage}>test button</button>
  <button on:click={init}>Start</button>
  <button on:click={testConnection}>Test Connection</button>
  <button on:click={clearClients}>Refresh Server</button>
  <button on:click={showMyId}>What is my id</button>
  <button on:click={getServerIds}>What Ids are in the server</button>
  <div>
    <video id="localVideo" width="320" height="240" autoplay>
      <track kind="captions" />
    </video>
    <div id="video-container">
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
    margin-top: 20px;
  }

  #video-container {
    display: flex;
    flex-wrap: wrap;
  }
</style>
