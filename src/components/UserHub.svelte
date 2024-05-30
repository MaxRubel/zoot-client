<script>
  import { onMount } from "svelte";
  import { joinARoom, joinAWs } from "../api/rooms";
  import { v4 as uuidv4 } from "uuid";
  import { clientId } from "../../stores/auth_store";
  import App from "../App.svelte";

  let pausedVid = true;
  let pausedAudio = true;
  let streamVid;
  let streamAudio;
  let videoElement;
  let audioElement;
  let peerConnection;
  const currentUrl = window.location.href;
  const [, , , , roomId] = currentUrl.split("/");

  const ws = new WebSocket("ws://localhost:8080/ws");

  ws.onmessage = (e) => {
    console.log(e.data);
  };

  ws.onopen = () => {
    console.log("Connected to server");

    ws.send(`1&${roomId}&${idValue}`);
  };

  let idValue;

  clientId.subscribe((value) => {
    idValue = value;
  });

  const payload2 = {
    roomId,
    clientId: idValue,
  };

  joinARoom(payload2);

  onMount(() => {
    pausedVid = true;
    pausedAudio = true;
    videoElement = document.getElementById("video");
    audioElement = document.getElementById("audio");
    const payload = {
      roomId,
      clientId,
    };

    // joinAWs({ roomId });
  });

  const cameraOn = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (mediaStream) {
        streamVid = mediaStream;
        videoElement.srcObject = streamVid;
        const videoTrack = streamVid.getVideoTracks()[0];
        if (peerConnection) {
          peerConnection.addTrack(videoTrack, streamVid);
        }
      })
      .catch(function (error) {
        console.error("Error accessing the webcam:", error);
      });
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

  const cameraOff = () => {
    if (streamVid) {
      const tracks = streamVid.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      videoElement.srcObject = null;
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

  const handlePauseAudio = () => {
    pausedAudio = !pausedAudio;
    if (pausedAudio) {
      micOff();
    } else {
      micOn();
    }
  };

  const sendTestMessage = () => {
    ws.send(`0&${roomId}&${idValue}`);
  };
</script>

<main>
  <button on:click={sendTestMessage}>test button</button>
  <div>
    <video id="video" width="640" height="480" autoplay>
      <track kind="captions" />
    </video>
    <audio id="audio" autoplay></audio>
  </div>
  <div class="top">
    <button on:click={handlePauseVid}>
      {pausedVid ? "Turn On Camera" : "Turn Off Camera"}
    </button>
    <button on:click={handlePauseAudio}>
      {pausedAudio ? "Turn On Microphone" : "Turn Off Microphone"}
    </button>
  </div>
</main>

<style>
  .top {
    margin-top: 20px;
  }
</style>
