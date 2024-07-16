<script>
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import LocalVideoSmall from "../media/LocalVideoSmall.svelte";
  import PeerMediaSmall from "../media/PeerMediaSmall.svelte";
  import ScreenSharer from "../media/ScreenSharer.svelte";
  import YouArePresenting from "../cutscreens/YouArePresenting.svelte";

  export let peerConnections;
  export let localVideo;
  export let myId;
  export let update_screen_sharer;
  export let screen_sharer_id;

  let presenter = null;
  let presenterId;
  let scrollContainer;
  let rightArrowButton;
  let leftArrowButton;
  let showButtons = false;

  function scrollLeft() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: -450, behavior: "smooth" });
  }

  function scrollRight() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: 450, behavior: "smooth" });
  }

  const handleMouseEnter = () => {
    if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
      showButtons = true;
    }
  };

  const handleMouseLeave = () => {
    showButtons = false;
  };

  const iAmSpeaking = (id) => {
    presenterId = id;
  };

  $: {
    if (screen_sharer_id) {
      Object.entries(peerConnections).forEach(([peerId, peer]) => {
        if (peerId === screen_sharer_id) {
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
        {screen_sharer_id}
      />
      {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
        <PeerMediaSmall
          {connection}
          {peerId}
          {iAmSpeaking}
          {update_screen_sharer}
          {screen_sharer_id}
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

  <div class="presenter-div">
    {#if myId !== screen_sharer_id}
      <ScreenSharer connection={presenter} peerId={screen_sharer_id} />
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
  }

  .scroll-button {
    display: flex;
    height: 35px;
    width: 55px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(24, 59, 90, 0.328);
    border: none;
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
</style>
