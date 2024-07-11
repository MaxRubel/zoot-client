<script>
  import LocalVideoGallery from "../media/LocalVideoGallery.svelte";
  import PeerMediaGallery from "../media/PeerMediaGallery.svelte";
  import { userState } from "../../../stores/media/userState";
  import { onDestroy } from "svelte";

  export let peerConnections;
  export let localVideo;
  export let update_screen_sharer;

  let showingSelf;

  const unsubscribe = userState.subscribe((value) => {
    showingSelf = !value.hideSelf;
    console.log(showingSelf);
  });

  onDestroy(unsubscribe);

  $: totalVideos = showingSelf
    ? Object.keys(peerConnections).length + 1
    : Object.keys(peerConnections).length;

  let columns;
  let rows;

  $: {
    if (totalVideos <= 1) {
      columns = 1;
    } else if (totalVideos === 2) {
      columns = 2;
      rows = 2;
    } else if (totalVideos <= 4) {
      columns = 2;
      rows = 2;
    } else if (totalVideos <= 9) {
      columns = 3;
      rows = 3;
    } else {
      columns = 4;
      rows = Math.ceil(totalVideos / 4);
    }
  }
</script>

<div class="video-container" style="--columns: {columns}">
  <LocalVideoGallery {localVideo} {columns} />

  {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
    <PeerMediaGallery {connection} {peerId} {update_screen_sharer} />
  {/each}
</div>

<style>
  .video-container {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 4px;
    width: 100%;
    height: 87vh;
    padding: 4px;
    box-sizing: border-box;
  }
</style>
