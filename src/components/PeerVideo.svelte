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

<video bind:this={videoElement} width="640" height="480" autoplay muted>
  <track kind="captions" />
</video>

<style>
  video {
    margin: 10px;
  }
</style>
