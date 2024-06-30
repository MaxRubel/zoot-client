<script>
  // @ts-nocheck

  import { onMount } from "svelte";
  import { getAudioContext } from "../../stores/media/audioContext";
  export let connection;

  let videoElement;
  const audioContext = getAudioContext();
  onMount(() => {
    if (connection) {
      connection.ontrack = (event) => {
        if (event.track.kind === "audio") {
          if (!audioContext) {
            console.warn("there is no audio context setup");
            return;
          }
          const audioStream = new MediaStream([event.track]);
          const sourceNode = audioContext.createMediaStreamSource(audioStream);
          sourceNode.connect(audioContext.destination);
        }

        if (event.streams && event.streams[0] && event.track.kind === "video") {
          videoElement.srcObject = event.streams[0];
        }
      };
    }
  });
</script>

<video bind:this={videoElement} autoplay muted>
  <track kind="captions" />
</video>

<style>
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
