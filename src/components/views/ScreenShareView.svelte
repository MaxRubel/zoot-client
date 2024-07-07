<script>
  import { onDestroy } from "svelte";
  import { userPreferences } from "../../../stores/media/userPreferences";
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import LocalVideoSmall from "../media/LocalVideoSmall.svelte";
  import PeerMediaSmall from "../media/PeerMediaSmall.svelte";
  import ScreenSharer from "../media/ScreenSharer.svelte";
  import YouArePresenting from "../YouArePresenting.svelte";

  export let peerConnections;
  export let audioOn;
  export let videoOn;
  export let pauseImage;
  export let localVideo;
  export let myId;
  export let receive_end_screenshare;
  export let updatePresenter;
  export let screen_sharer;

  let presenter = null;
  let userPrefs;
  let presenterId;

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

  console.log(myId);
  $: {
    if (screen_sharer) {
      Object.entries(peerConnections).forEach(([peerId, peer]) => {
        if (peerId === screen_sharer) {
          presenter = peer;
        }
      });
    }
  }

  let videoStream1;
  let videoStream2;

  $: {
    if (localVideo) {
      videoStream1 = localVideo.clone();
      videoStream2 = localVideo.clone();
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
        localVideo={videoStream1}
      />
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMediaSmall
          {connection}
          {peerId}
          {iAmSpeaking}
          {receive_end_screenshare}
          {updatePresenter}
        />
      {/each}
    </div>

    <button class="scroll-button right-scroll centered" on:click={scrollRight}>
      <RightArrow />
    </button>
  </div>

  <div class="presenter-div">
    {#if myId !== screen_sharer}
      <ScreenSharer connection={presenter} peerId={screen_sharer} />
    {:else}
      <YouArePresenting />
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
    padding: 0px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    height: 11vh;
    padding-bottom: 12px;
    margin-bottom: 12px;
    justify-content: center;
    border-bottom: 1px solid rgb(104, 104, 104);
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

  .presenter-div {
    margin-top: 3px;
    width: 100%;
    height: 80vh;
    display: flex;
    justify-content: center;
  }
</style>
