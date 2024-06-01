<script>
  // @ts-nocheck

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
  const currentUrl = window.location.href;
  const [, , , , roomId] = currentUrl.split("/");

  const ws = new WebSocket("ws://localhost:8080/ws");
  let peerConnection = new RTCPeerConnection();

  // ------start-negotiation---------

  function sendOffer(offer) {
    ws.send(`2&${roomId}&&${JSON.stringify({ ...offer })}`);
  }

  // Add event listener for when the negotiation is needed
  const startCall = async () => {
    try {
      const offer = await peerConnection.createOffer();
      console.log(offer);
      await peerConnection.setLocalDescription(offer);
      sendOffer(offer);
    } catch (err) {
      console.error(err);
    }
  };
  // peerConnection.onicecandidate = (event) => {
  //   if (event.candidate) {
  //     // Send the ICE candidate to the other peer
  //   }
  // };

  // peerConnection.onnegotiationneeded = async () => {
  //   try {
  //     // Create an offer and set it as the local description
  //     await peerConnection.setLocalDescription(
  //       await peerConnection.createOffer(),
  //     );

  //     // Send the offer to the other peer
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // peerConnection.ontrack = (event) => {
  //   // Add the track to the DOM for example
  //   // videoElement.srcObject = event.streams[0];
  // };

  // peerConnection.ondatachannel = (event) => {
  //   const dataChannel = event.channel;
  //   dataChannel.onmessage = (event) => {
  //     console.log("Message received:", event.data);
  //   };
  // };

  // const dataChannel = peerConnection.createDataChannel("myDataChannel");
  // dataChannel.onopen = () => {
  //   dataChannel.send("Hello, world!");
  // };

  // ----------end-negotiation--------

  const addOffer = async (offer) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    console.log("answer created:", answer);
  };

  ws.onmessage = (e) => {
    if (e.data[0] === "{") {
      console.log("received JSON");
      const data = JSON.parse(e.data);
      console.log("unpacked the JSON:", data);
      if (data.type === "offer") {
        addOffer(data);
      }
    }
  };

  const requestOffer = () => {
    ws.send(`3&${roomId}&&`);
  };

  ws.onopen = async () => {
    console.log("Connected to server");

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("sending offer:", offer);
    ws.send(`1&${roomId}&${idValue}&${JSON.stringify({ ...offer })}`);
    // ws.send(`2&${roomId}&&${JSON.stringify({ ...offer })}`);
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
    ws.send(`0&${roomId}&${idValue}&`);
  };
</script>

<main>
  <button on:click={sendTestMessage}>test button</button>
  <button on:click={startCall}>Send Offer</button>
  <button on:click={requestOffer}>Receive Offer</button>
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
