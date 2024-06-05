<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";
  import { checkPeerConnection } from "../../utils/ws/checkPeerConnection";
  import { addPeersToLocal } from "../../utils/hub/addClientsToLocal";
  import PeerVideo from "./PeerVideo.svelte";

  let pausedVid = true;
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

  window.addEventListener("beforeunload", function (event) {
    ws.send(`3&${myId}&0`);
  });

  ws.onopen = () => {
    console.log("Connected to server");
    ws.send(`1&${myId}&0&`);
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
  });

  const cameraOn = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (mediaStream) {
        streamVid = mediaStream;
        localVideo.srcObject = streamVid;
        streamVid.getTracks().forEach((t) => (t.enabled = true));
      })
      .catch(function (error) {
        console.error("Error accessing the webcam:", error);
      });
    const connections = Object.values(peerConnections);
    connections.forEach((conn) => {
      const videoSender = conn.getSenders().find(function (s) {
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

      // Disable the video sender track
      const videoSender = peerConnection.getSenders().find(function (s) {
        return s.track?.kind === "video";
      });
      if (videoSender) {
        videoSender.track.enabled = false;
      }
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
      cameraOn();

      peerConnections[peerId] = new RTCPeerConnection();

      const stream = await getUserMedia();
      stream.getTracks().forEach((track) => {
        peerConnections[peerId].addTrack(track, stream);
      });

      const offer = await peerConnections[peerId].createOffer();
      console.log("offer: ", offer);
      console.log("i have attached my media");

      await peerConnections[peerId].setLocalDescription(offer);
      console.log("i have set my offer: ", peerConnections[peerId]);

      peerConnections[peerId].onicecandidate = (event) => {
        if (event.candidate) {
          const data = {
            type: "iceCandidate",
            candidate: event.candidate,
          };
          console.log("sending ice candidate: ");
          ws.send(`2&${myId}&${peerId}&${JSON.stringify(data)}`);
        }
      };

      ws.send(`2&${myId}&${peerId}&${JSON.stringify(offer)}`);
    } catch (error) {
      console.error("Error during negotiation: ", error);
    }
  };

  // peerConnection.onicecandidate = (event) => {
  //   if (event.candidate) {
  //     console.log("sending ice candidate:", event.candidate);
  //     ws.send(
  //       `2&${myId}&${peerId}&${JSON.stringify({ type: "iceCandidate", candidate: event.candidate })}`,
  //     );
  //   }
  // };

  ws.onmessage = async (e) => {
    // Test message received back from server
    if (e.data[0] === "0") {
      console.log(e.data);
    }

    // Array of clients received from server when joining
    if (e.data[0] === "4") {
      joined = false;
      console.log("array of clients: ", e.data);
      const clientArr = e.data.split("&");
      peers = addPeersToLocal(peers, myId, clientArr);
    }

    // RTCPeerConnection stuff:
    if (e.data[0] === "3") {
      const [_, senderId, receiverId, data] = e.data.split("&");
      // console.log("sender Id: ", senderId);

      // Parse and process the data
      const parsed = JSON.parse(data);
      // console.log("incoming data type: ", parsed.type);

      // This message came from me
      if (senderId === myId) {
        // console.log(`this is my own ${parsed.type}. Ignoring...`);
        return;
      }

      // This message is for someone else
      if (receiverId !== myId) {
        // console.log(`i am: ${myId}, this ${parsed.type} is for ${receiverId}`);
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
        // console.log("parsed offer...", parsed);
        if (peerConnection.remoteDescription) {
          console.log("this sender is already in the peer connections array:");
        } else {
          peerConnection.setRemoteDescription(
            new RTCSessionDescription(parsed),
          );
          const stream = await getUserMedia();
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
          });
          const answer = await peerConnection.createAnswer();
          // console.log("i have attached my media");
          peerConnection.setLocalDescription(answer);
          // console.log("sending answer...", answer);

          ws.send(`2&${myId}&${senderId}&${JSON.stringify(answer)}`);
        }
      }

      // Handling 'answer' message type
      if (parsed.type === "answer") {
        // console.log("i have received an answer: ", parsed);
        if (peerConnection.remoteDescription) {
          // console.log("already have an answer bruh");
        } else {
          peerConnection.setRemoteDescription(
            new RTCSessionDescription(parsed),
          );
          console.log("I was the last to receive data!");
        }
      }

      // Handling 'iceCandidate' message type
      if (parsed.type === "iceCandidate") {
        console.log("receinving ice candidate");
        if (peerConnection.remoteDescription) {
          peerConnection
            .addIceCandidate(new RTCIceCandidate(parsed.candidate))
            .then(() => {
              console.log("success!");
              cameraOn();
            });
        }
      }
    }
  };

  const testConnection = () => {
    const connections = Object.values(peerConnections);

    console.log("number of connections: ", connections.length);
    connections.forEach((conn, index) => {
      const connObj = {
        connection: index + 1,
        localDescription: conn.localDescription,
        remoteDescription: conn.remoteDescription,
      };
      console.log(connObj);
    });
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
  <button on:click={clearClients}>Clear Clients</button>
  <button on:click={showMyId}>What is my id</button>
  <button on:click={getServerIds}>What Ids are in the server</button>
  <div>
    <video id="localVideo" width="640" height="480" autoplay>
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
    <button on:click={handlePauseVid}>
      {pausedVid ? "Turn On Camera" : "Turn Off Camera"}
    </button>
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
