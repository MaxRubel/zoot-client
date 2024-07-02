<script>
  // @ts-nocheck

  import { onDestroy, onMount } from "svelte";
  import { getAudioContext } from "../../stores/media/audioContext";
  export let connection;

  let videoElement;
  let streamPaused = false;

  onMount(() => {
    const audioContext = getAudioContext();

    connection.ontrack = (event) => {
      if (event.track.kind === "audio") {
        const audioStream = new MediaStream([event.track]);
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(audioContext.destination);
      }
      if (event.streams && event.streams[0] && event.track.kind === "video") {
        videoElement.srcObject = event.streams[0];
      }
    };

    connection.ondatachannel = (e) => {
      const dataChannel = e.channel;
      dataChannel.onmessage = (e) => {
        if (e.data === "muted") {
          streamPaused = true;
        } else if (e.data === "live") {
          streamPaused = false;
        }
      };
    };
  });
</script>

<video
  bind:this={videoElement}
  style="display: {streamPaused ? 'none' : 'block'}"
  autoplay
  muted
>
  <track kind="captions" />
</video>

<img
  src="/relax2.gif"
  style="display: {streamPaused ? 'block' : 'none'}"
  alt=""
/>

<style>
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  img {
    aspect-ratio: 4/3;
    width: 480px;
    width: 100%;
    height: 100%;
    /* min-height: 250px; */
    object-fit: fill;
  }
</style>
