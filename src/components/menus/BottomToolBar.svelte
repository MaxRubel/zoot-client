<script>
  import MicIcon from "../../assets/MicIcon.svelte";
  import MicOff from "../../assets/MicOff.svelte";
  import ShareScreen from "../../assets/ShareScreen.svelte";
  import BackIcon from "../../assets/BackIcon.svelte";
  import CameraOff from "../../assets/CameraOff.svelte";
  import CameraOn from "../../assets/CameraOn.svelte";

  export let handleMic;
  export let handleCamera;
  export let handleScreenShare;
  export let audioOn;
  export let videoOn;
</script>

<div class="bottom">
  <div id="marginLeft" />
  <div class="mid-bottom centered">
    <button class="clear" on:click={handleMic}>
      {#if audioOn}
        <MicIcon />Mute Mic
      {:else}
        <MicOff />Activate Mic
      {/if}
    </button>
    <button class="clear" on:click={handleCamera}>
      {#if videoOn}
        <CameraOn />Stop Video
      {:else}
        <CameraOff />Start Video
      {/if}
    </button>
    <button class="clear" on:click={handleScreenShare}>
      <ShareScreen />Share Screen
    </button>
  </div>
  <div class="centered">
    <a href="/"><button class="clear red"><BackIcon />Leave Room</button></a>
  </div>
</div>

<style>
  .bottom {
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    background-color: rgba(46, 46, 46, 0.3);
    backdrop-filter: blur(10px);
    position: fixed;
    bottom: 0;
    left: 0;
    height: 70px;
    width: 100vw;
    min-width: 350px;
    z-index: 30;
  }

  .clear {
    display: flex;
    height: 60px;
    padding: 5px 15px;
    font-size: 14px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    background-color: rgba(24, 59, 90, 0.328);
    color: rgb(255, 255, 255);
    /* border: 1px solid rgba(123, 123, 123, 0.593); */
  }

  .red {
    background-color: rgb(79, 0, 0, 0.7);
    border: none;
  }
</style>
