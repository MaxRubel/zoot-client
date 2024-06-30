<script>
  import { createAudioContext } from "../../../stores/media/audioContext";
  export let confirmAudio;
  export let closeModal;
  export let hookUpAudioContext;
</script>

<div class="modal-overlay" class:active={confirmAudio}>
  <div class="modal">
    <h2>Connect Audio</h2>
    <p>Press OK to connect with system audio.</p>
    <button on:click={hookUpAudioContext}>OK</button>
    <button on:click={closeModal}>Cancel</button>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    visibility: hidden;
    opacity: 0;
    transition:
      visibility 0s,
      opacity 0.3s;
    z-index: 1;
  }

  .modal-overlay.active {
    visibility: visible;
    opacity: 1;
  }

  .modal {
    background-color: aliceblue;
    padding: 20px;
    border-radius: 5px;
    max-width: 80%;
    z-index: 2;
    position: relative;
  }

  button {
    z-index: 3;
    position: relative;
  }
</style>
