<script>
  import MicIcon from "../../assets/MicIcon.svelte";
  import MicOff from "../../assets/MicOff.svelte";
  import ShareScreen from "../../assets/ShareScreen.svelte";
  import BackIcon from "../../assets/BackIcon.svelte";
  import CameraOff from "../../assets/CameraOff.svelte";
  import CameraOn from "../../assets/CameraOn.svelte";
  import { onDestroy } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let handleMic;
  export let handleCamera;
  export let handleScreenShare;

  let user_state;

  const unsubscribe = userState.subscribe((value) => {
    user_state = value;
  });

  onDestroy(unsubscribe);
</script>

<div class="bottom-tool-bar-container">
  <div id="marginLeft"></div>
  <div class="mid-bottom centered">
    <button class="clear" on:click={handleMic}>
      {#if user_state.audioOn}
        <MicIcon />Mute Mic
      {:else}
        <MicOff />Activate Mic
      {/if}
    </button>
    <button class="clear" on:click={handleCamera}>
      {#if user_state.videoOn}
        <CameraOn />Stop Video
      {:else}
        <CameraOff />Start Video
      {/if}
    </button>
    <button class="clear" on:click={handleScreenShare}>
      <ShareScreen />Share Screen
    </button>
  </div>
  <div class="centered leave-room">
    <a href="/"><button class="clear red"><BackIcon />Leave Room</button></a>
  </div>
</div>

<style>
  .bottom-tool-bar-container {
    background-color: #11151d;
    display: grid;
    grid-template-columns: minmax(100px, 1fr) 4fr 1fr;
    backdrop-filter: blur(10px);
    position: fixed;
    bottom: 0;
    left: 0;
    height: 75px;
    width: 100vw;
    min-width: 350px;
    z-index: 30;
  }

  #marginLeft {
    grid-column: 1;
  }

  .clear {
    display: flex;
    height: 65px;
    width: 125px;
    padding: 5px 15px;
    font-size: 14px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    background-color: rgba(24, 59, 90, 0.328);
    border: none;
    color: rgb(255, 255, 255);
  }

  .red {
    background-color: #8a1f04;
    border: none;
  }

  button:hover {
    background-color: #535bf2;
  }

  button:focus {
    outline: 2px solid #535bf2;
    outline-offset: 2px;
  }

  button:active {
    background-color: #4347d9;
  }

  @media screen and (max-width: 605px) {
    .bottom-tool-bar-container {
      grid-template-columns: 4fr 1fr;
    }

    .clear {
      width: 120px;
      padding: 2px;
    }

    #marginLeft {
      display: none;
    }

    .mid-bottom {
      grid-column: 1;
    }
  }
</style>
