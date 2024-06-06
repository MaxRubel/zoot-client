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

<div class="border">
  <video bind:this={videoElement} width="320" height="240" autoplay muted>
    <track kind="captions" />
  </video>
</div>

<style>
  video {
    margin: 10px;
  }
  .border {
    border: 1px solid black;
  }
</style>
