<script>
  import { onDestroy } from "svelte";
  import { userPreferences } from "../../../stores/media/userPreferences";
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import BigSpeaker from "../media/BigSpeaker.svelte";
  import LocalVideoSmall from "../media/LocalVideoSmall.svelte";
  import LocalVideoSpeaking from "../media/LocalVideoSpeaking.svelte";
  import PeerMediaSmall from "../media/PeerMediaSmall.svelte";

  export let peerConnections;
  export let audioOn;
  export let videoOn;
  export let pauseImage;
  export let videoStream;
  export let myId;

  let presenterId = null;
  let presenter = null;
  let userPrefs;

  function scrollLeft() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: -450, behavior: "smooth" });
  }

  function scrollRight() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: 450, behavior: "smooth" });
  }

  const unsubscribe = userPreferences.subscribe((value) => {
    userPrefs = value;
  });

  onDestroy(unsubscribe);

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
      <LocalVideoSmall
        {iAmSpeaking}
        {audioOn}
        {videoOn}
        {pauseImage}
        videoStream={videoStream1}
      />
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMediaSmall {connection} {peerId} {iAmSpeaking} />
      {/each}
    </div>

    <button class="scroll-button right-scroll centered" on:click={scrollRight}>
      <RightArrow />
    </button>
  </div>

  <div class="speaker-div">
    {#if presenterId}
      {#if presenterId === myId}
        <LocalVideoSpeaking
          {audioOn}
          {videoOn}
          {pauseImage}
          videoStream={videoStream2}
        />
      {:else}
        <BigSpeaker connection={presenter} peerId={presenterId} small={false} />
      {/if}
    {/if}
  </div>
</div>

<style>
  .presenter-view-container {
    margin-top: 5px;
  }
  .scroll-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .scroll-container {
    display: flex;
    overflow-x: auto;
    gap: 15px;
    padding: 0px 35px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    max-height: 18vh;
    min-height: 132px;
    padding-bottom: 12px;
    justify-content: center;
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: 1px solid rgb(109, 109, 109);
    padding: 15px 5px;
    cursor: pointer;
    z-index: 100;
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
    margin-top: 3px;
    width: 100%;
    height: 50vh;
  }
</style>
