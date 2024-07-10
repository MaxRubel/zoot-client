<script>
  import LocalVideoGallery from "../media/LocalVideoGallery.svelte";
  import PeerMediaGallery from "../media/PeerMediaGallery.svelte";
  export let peerConnections;
  export let localVideo;
  export let update_screen_sharer;
</script>

<div class="top">
  <div id="video-container">
    <LocalVideoGallery {localVideo} />

    {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
      <PeerMediaGallery {connection} {peerId} {update_screen_sharer} />
    {/each}
  </div>
</div>

<style>
  .top {
    margin-top: 10px;
  }

  #video-container {
    height: 80vh;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    overflow: auto;
  }

  :global(#video-container > *) {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: calc(50% - 5px);
    max-width: calc(50% - 5px);
    min-width: calc(50% - 5px);
    height: auto;
    aspect-ratio: 16 / 9;
  }

  /* @media (max-width: 768px) {
    :global(#video-container > *) {
      flex-basis: 100%;
      max-width: 100%;
      min-width: 100%;
    } */
  /* } */
</style>
