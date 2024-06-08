<script>
  import { onMount } from "svelte";

  export let connection;
  let videoElement;

  onMount(() => {
    if (connection) {
      connection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          videoElement.srcObject = event.streams[0];
        }
      };
    }
  });
</script>

<main>
  <video bind:this={videoElement} autoplay muted>
    <track kind="captions" />
  </video>
</main>

<style>
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
