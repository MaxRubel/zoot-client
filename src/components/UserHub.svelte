<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { clientId } from "../../stores/auth_store";

  let pausedVid = true;
  let pausedAudio = true;
  let streamVid;
  let streamAudio;
  let localVideo;
  let remoteVideo;
  let audioElement;
  let peers = [];

  const ws = new WebSocket("ws://localhost:8080/ws");
  let peerConnection = new RTCPeerConnection();

  window.addEventListener("beforeunload", function (event) {
    ws.send(`3&${idValue}&0`);
  });

  ws.onopen = () => {
    console.log("Connected to server");
    ws.send(`1&${idValue}&0`);
  };

  let idValue;

  clientId.subscribe((value) => {
    idValue = value;
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
    const videoSender = peerConnection.getSenders().find(function (s) {
      return s.track?.kind === "video";
    });
    if (videoSender) {
      videoSender.track.enabled = true;
    }
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
    ws.send(`0&${idValue}&0`);
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

  const startNegotiations = async () => {
    cameraOn();
    const stream = await getUserMedia();
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
    const offer = await peerConnection.createOffer();
    console.log("i have attached my media");
    peerConnection.setLocalDescription(offer);
    ws.send(`2&${idValue}&${JSON.stringify(offer)}`);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      ws.send(
        `2&lalala&${JSON.stringify({ type: "iceCandidate", candidate: event.candidate })}`,
      );
    }
  };

  peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = stream;
    remoteVideo.play();
  };

  const addClientsToLocal = (arr) => {
    for (let i = 1; i < arr.length; i++) {
      console.log(peers.some((item) => item === arr[i]));
      if (peers.some((item) => item === arr[i]) || arr[i] === idValue) {
        continue;
      } else {
        peers.push(arr[[i]]);
      }
    }
  };

  ws.onmessage = async (e) => {
    //receive array of client ids when you join!
    if (e.data[0] === "4") {
      console.log("array of clients: ", e.data);
      const clientArr = e.data.split("&");
      addClientsToLocal(clientArr);
    }

    if (e.data[0] === "3") {
      console.log("received offer");
      const [, senderId, data] = e.data.split("&");

      if (senderId === idValue) {
        console.log("this is my own offer. Ignoring...");
        return;
      }

      const parsed = JSON.parse(data);
      if (parsed.type === "offer") {
        console.log("parsed offer...", parsed);

        peerConnection.setRemoteDescription(parsed);
        const stream = await getUserMedia();
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
        const answer = await peerConnection.createAnswer();
        console.log("i have attached my media");
        peerConnection.setLocalDescription(answer);
        console.log("sending answer...", answer);

        ws.send(`2&${idValue}&${JSON.stringify(answer)}`);
      }
      if (parsed.type === "answer") {
        peerConnection.setRemoteDescription(parsed);
        console.log("I was the last to receive data!");
      }
      if (parsed.type === "iceCandidate") {
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(parsed.candidate).then(() => {
            console.log("candidate has been setup");
            cameraOn();
          });
        }
      }
    }
  };

  const testConnection = () => {
    console.log("remote desc:", peerConnection.remoteDescription);
    console.log("local desc:", peerConnection.localDescription);
  };

  const clearClients = () => {
    ws.send("4&&");
  };

  $: console.log("camera is paused: ", pausedVid);
</script>

<main>
  <button on:click={sendTestMessage}>test button</button>
  <button on:click={startNegotiations}>Start</button>
  <button on:click={testConnection}>Test Connection</button>
  <button on:click={clearClients}>Clear Clients</button>
  <div>
    <video id="localVideo" width="640" height="480" autoplay>
      <track kind="captions" />
    </video>
    <video id="remoteVideo" width="640" height="480" autoplay>
      <track kind="captions" />
    </video>
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
</style>
