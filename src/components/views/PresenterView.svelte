<script>
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import BigSpeaker from "../BigSpeaker.svelte";
  import LocalVideo from "../LocalVideo.svelte";
  import PeerMedia from "../PeerMedia.svelte";
  import { clientId } from "../../../stores/auth_store";
  import { onDestroy, onMount } from "svelte";

  export let peerConnections;
  export let audioOn;
  export let videoOn;
  export let pauseImage;
  export let updatePeerStates;
  export let peerStates;
  export let videoStream;

  let presenterId = null;
  let presenter = null;
  let myId;

  const unsubscribe = clientId.subscribe((value) => {
    myId = value;
  });

  onDestroy(unsubscribe);

  function scrollLeft() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: -450, behavior: "smooth" });
  }

  function scrollRight() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: 450, behavior: "smooth" });
  }

  const iAmSpeaking = (id) => {
    presenterId = id;
  };

  $: {
    if (presenterId) {
      Object.entries(peerConnections).forEach(([peerId, peer]) => {
        if (peerId === presenterId) {
          presenter = peer;
        }
      });
    }
  }

  let videoStream1;
  let videoStream2;

  $: {
    if (videoStream) {
      console.log("cloning");
      videoStream1 = videoStream.clone();
      videoStream2 = videoStream.clone();
    }
  }
</script>

<div class="presenter-view-container">
  <div class="scroll-wrapper">
    <button class="scroll-button left-scroll centered" on:click={scrollLeft}>
      <LefttArrow />
    </button>

    <div class="scroll-container">
      <LocalVideo
        small={true}
        {iAmSpeaking}
        {audioOn}
        {videoOn}
        {pauseImage}
        videoStream={videoStream1}
      />
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMedia
          small={true}
          {connection}
          {peerId}
          {iAmSpeaking}
          {updatePeerStates}
          {peerStates}
        />
      {/each}
    </div>

    <button class="scroll-button right-scroll centered" on:click={scrollRight}>
      <RightArrow />
    </button>
  </div>

  <div class="speaker-div">
    {#if presenterId && presenterId === myId}
      <LocalVideo
        small={false}
        {audioOn}
        {videoOn}
        {pauseImage}
        videoStream={videoStream2}
        {iAmSpeaking}
      />
    {:else}
      <BigSpeaker
        {peerStates}
        connection={presenter}
        peerId={presenterId}
        small={false}
      />
    {/if}
  </div>
</div>

<style>
  .presenter-view-container {
    border: 2px solid rgb(51, 51, 51);
    margin-top: 5px;
  }
  .scroll-wrapper {
    border-bottom: 2px solid rgb(51, 51, 51);
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    /* background-color: transparent; */
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    max-height: 18vh;
    min-height: 125px;
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid rgb(109, 109, 109);
    padding: 15px 5px;
    cursor: pointer;
    z-index: 10;
  }

  .scroll-button:active {
    border: none;
  }

  .left-scroll {
    left: 0;
  }

  .right-scroll {
    right: 0;
  }

  .speaker-div {
    width: 100%;
    height: 50vh;
  }
</style>
