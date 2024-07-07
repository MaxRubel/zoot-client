<script>
  import LocalVideoGallery from "../media/LocalVideoGallery.svelte";
  import PeerMediaGallery from "../media/PeerMediaGallery.svelte";
  export let peerConnections;
  export let localVideo;
  export let receive_end_screenshare;
  export let update_screen_sharer;
</script>

<div class="top">
  <div id="video-container" class="top">
    <LocalVideoGallery {localVideo} />

    {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
      <PeerMediaGallery
        {connection}
        {peerId}
        {receive_end_screenshare}
        {update_screen_sharer}
      />
    {/each}
  </div>
</div>

<style>
  .top {
    margin-top: 10px;
  }

  #video-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 5px;
    padding: 0px 3px;
    margin-bottom: 80px;
  }

  @media screen and (max-width: 600px) {
    #video-container {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (min-width: 601px) {
    #video-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
