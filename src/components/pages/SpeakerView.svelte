<script>
  import { onMount } from "svelte";
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import BigSpeaker from "../media/BigSpeaker.svelte";
  import LocalVideoSmall from "../media/LocalVideoSmall.svelte";
  import LocalVideoSpeaking from "../media/LocalVideoSpeaking.svelte";
  import PeerMediaSmall from "../media/PeerMediaSmall.svelte";

  export let peerConnections;
  export let localVideo;
  export let myId;
  export let update_screen_sharer;

  let presenterId = null;
  let presenter = null;
  let scrollContainer;
  let leftArrowButton;
  let rightArrowButton;
  let showButtons = false;

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
    if (localVideo) {
      videoStream1 = localVideo.clone();
      videoStream2 = localVideo.clone();
    }
  }

  const handleMouseEnter = () => {
    if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
      showButtons = true;
    }
  };

  const handleMouseLeave = () => {
    showButtons = false;
  };

  onMount(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
</script>

<div class="presenter-view-container">
  <div
    class="scroll-wrapper"
    role="region"
    aria-label="Scrollable content"
    tabindex="-1"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    <button
      class="scroll-button left-scroll centered"
      bind:this={leftArrowButton}
      on:click={scrollLeft}
      class:visible={showButtons}
    >
      <LefttArrow />
    </button>

    <div class="scroll-container" bind:this={scrollContainer}>
      <LocalVideoSmall
        {iAmSpeaking}
        localVideo={videoStream1}
        screen_sharer_id={null}
      />
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMediaSmall
          {connection}
          {peerId}
          {iAmSpeaking}
          {update_screen_sharer}
          screen_sharer_id={null}
        />
      {/each}
    </div>

    <button
      class="scroll-button right-scroll centered"
      bind:this={rightArrowButton}
      on:click={scrollRight}
      class:visible={showButtons}
    >
      <RightArrow />
    </button>
  </div>

  <div class="speaker-div">
    {#if presenterId}
      {#if presenterId === myId}
        <LocalVideoSpeaking localVideo={videoStream1} />
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
    display: flex;
    justify-content: center;
  }

  .scroll-container {
    display: flex;
    gap: 10px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    padding: 10px 0px;
    padding-bottom: 10px;
    overflow-x: auto;
    margin: 0% 1%;
    margin-top: 18px;
  }

  .scroll-button {
    display: flex;
    height: 70px;
    width: 44px;
    position: absolute;
    top: 50%;
    transform: translateY(-55%);
    background-color: rgba(24, 59, 90, 0.6);
    border: none;
    padding: 15px 5px;
    cursor: pointer;
    z-index: 100;
    transition: all ease 2s;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
  }

  .visible {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }

  .scroll-button:hover {
    background-color: rgb(83, 91, 242, 0.6);
  }

  button:focus,
  button:active {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  .scroll-button:active {
    border: none;
  }
  .scroll-button:focus {
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
    display: flex;
    justify-content: center;
    width: 90vw;
    height: 63vh;
    margin: auto;
    margin-bottom: 64px;
  }
</style>
