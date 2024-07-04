<script>
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import MicOffRed from "../../assets/MicOffRed.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import BigSpeaker from "../BigSpeaker.svelte";
  import PeerMedia from "../PeerMedia.svelte";

  export let peerConnections;
  export let audioOn;
  export let videoOn;
  export let pauseImage;
  export let userPrefs;
  export let updatePeerStates;
  export let peerStates;

  let presenterId = null;
  let presenter = null;

  const small = true;

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

  $: console.log(presenter);
</script>

<div class="presenter-view-container">
  <div class="scroll-wrapper">
    <button class="scroll-button left-scroll centered" on:click={scrollLeft}>
      <LefttArrow />
    </button>

    <div class="scroll-container">
      <div
        class="self-view-small"
        style="display: {userPrefs.hideSelf ? 'none' : 'block'};"
      >
        <img
          class="paused-image"
          src={pauseImage}
          alt="Camera Paused..."
          style="display: {videoOn ? 'none' : 'block'};"
        />
        <video
          id="localVideo"
          autoplay
          style="display: {videoOn ? 'block' : 'none'};"
        >
          <track kind="captions" />
        </video>
        <div
          class="mic-symbol centered"
          style="display: {audioOn ? 'none' : 'block'}"
        >
          <MicOffRed />
        </div>
      </div>
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
    {#if presenter}
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
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    max-height: 18vh;
    min-height: 125px;
  }

  .scroll-container img {
    flex: 0 0 auto;
    width: 200px;
    height: auto;
    margin-right: 10px;
    aspect-ratio: 4/3;
  }

  #localVideo {
    flex: 0 0 auto;
    width: 200px;
    max-height: 18vh;
    min-height: 125px;
    margin-right: 10px;
    aspect-ratio: 4/3;
    object-fit: cover;
  }

  .self-view-small {
    position: relative;
  }

  .mic-symbol {
    position: absolute;
    bottom: 4px;
    left: 2px;
    position: absolute;
    color: rgb(30, 30, 30);
    background-color: rgb(248, 250, 285, 0.7);
    border-radius: 7px;
    padding-bottom: 3px;
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
    width: 100%; /* Adjust as needed */
    height: 50vh; /* Adjust as needed */
  }
</style>
