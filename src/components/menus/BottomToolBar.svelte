<script>
  import MicIcon from "../../assets/MicIcon.svelte";
  import MicOff from "../../assets/MicOff.svelte";
  import ShareScreen from "../../assets/ShareScreen.svelte";
  import BackIcon from "../../assets/BackIcon.svelte";
  import CameraOff from "../../assets/CameraOff.svelte";
  import CameraOn from "../../assets/CameraOn.svelte";
  import { onDestroy, onMount } from "svelte";
  import { userState } from "../../../stores/media/userState";

  export let handleMic;
  export let handleCamera;
  export let handleScreenShare;

  let user_state;
  let smallButton = false;
  let mediumButton = false;

  const unsubscribe = userState.subscribe((value) => {
    user_state = value;
  });

  const handleResize = () => {
    if (window.innerWidth < 550) {
      smallButton = true;
    } else {
      smallButton = false;
    }
    if (window.innerWidth >= 550 && window.innerWidth <= 827) {
      mediumButton = true;
    } else {
      mediumButton = false;
    }
  };

  onMount(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
  });
  onMount(() => {
    handleResize();
  });
  onDestroy(unsubscribe);
</script>

<div class="zzz">
  {#if !smallButton && !mediumButton}
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
      <div class="leave-room">
        <a href="/"><button class="clear red"><BackIcon />Leave Room</button></a
        >
      </div>
    </div>
  {/if}
  {#if mediumButton}
    <div class="medium-mid">
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

      <a href="/"><button class="clear red"><BackIcon />Leave Room</button></a>
    </div>
  {/if}
  {#if smallButton}
    <div class="bottom-tool-bar-container">
      <div class="small-container">
        <div class="top-row">
          <button class="clear vsmol" on:click={handleMic}>
            {#if user_state.audioOn}
              <MicIcon />Mute Mic
            {:else}
              <MicOff />Activate Mic
            {/if}
          </button>
          <button class="clear vsmol" on:click={handleCamera}>
            {#if user_state.videoOn}
              <CameraOn />Stop Video
            {:else}
              <CameraOff />Start Video
            {/if}
          </button>
          <button class="clear vsmol" on:click={handleScreenShare}>
            <ShareScreen />Share Screen
          </button>
        </div>
        <div class="centered leave-room">
          <a href="/"
            ><button class="clear red small-long"><BackIcon />Leave Room</button
            ></a
          >
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .medium-mid {
    background-color: #11151d;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 100;
  }
  .small-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto;
    left: 50%;
    transform: translate(-50%, -50%);
    bottom: -50px;
    z-index: 30;
    place-content: center;
    z-index: 100;
  }
  .top-row {
    display: flex;
    flex-direction: row;
    place-content: center;
  }

  .bottom-tool-bar-container {
    background-color: #11151d;
    display: grid;
    grid-template-columns: 1fr 4fr 1fr;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    z-index: 200;
  }

  #marginLeft {
    height: 100%;
    grid-column: 1;
  }

  .leave-room {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .clear {
    display: flex;
    height: 75px;
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

  .leave-room {
    place-content: center;
  }

  button:hover {
    background-color: #535bf2;
  }

  button:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  button:active {
    background-color: #4347d9;
  }

  @media screen and (max-width: 640px) {
    .bottom-tool-bar-container {
      grid-template-columns: 4fr 1fr;
    }

    .clear {
      min-width: 115px;
      padding: 2px;
    }

    #marginLeft {
      display: none;
    }

    .mid-bottom {
      grid-column: 1;
    }
  }

  .small-long {
    display: flex;
    align-items: center;
    padding: 0px;
    height: 53px;
    margin-top: 8px;
    width: 390px;
  }

  .vsmol {
    height: 53px;
  }
</style>
