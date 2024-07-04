<!-- <script>
  import PeerMedia from "../PeerMedia.svelte";

  export let peerConnections;
  export let updatePresenter;
  export let presenter;
</script>

{#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
  {#if peerId !== presenter}
    <div><PeerMedia {connection} {updatePresenter} /> not the presenter</div>
  {:else}
    <div><PeerMedia {connection} {updatePresenter} /> the presenter</div>
  {/if}
{/each} -->
