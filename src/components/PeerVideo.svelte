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
  .border {
    border: 1px solid black;
    padding: 10px;
    /* Ensure the container takes up the full width of the viewport */
    width: 100%;
    /* Add a maximum width to keep it from stretching too wide */
    max-width: 100%;
    /* Adjust the aspect ratio to match the video */
    position: relative;
    padding-top: 75%; /* 4:3 aspect ratio */
  }

  video {
    /* Make the video take up the full size of the container */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Cover the container without stretching */
  }
</style>
