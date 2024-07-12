<script>
  import LocalVideoGallery from "../media/LocalVideoGallery.svelte";
  import PeerMediaGallery from "../media/PeerMediaGallery.svelte";
  import { userState } from "../../../stores/media/userState";
  import { onDestroy, onMount } from "svelte";

  export let peerConnections;
  export let localVideo;
  export let update_screen_sharer;

  let selfView = null;
  let grid;
  let windowWidth;
  let colWidth = "1fr";
  let gridElement;

  const unsubscribe = userState.subscribe((value) => {
    selfView = !value.hideSelf;
  });

  onDestroy(unsubscribe);

  function calculateGrid() {
    const itemsLength = selfView
      ? Object.values(peerConnections).length + 1
      : Object.values(peerConnections).length;
    let rows = Math.ceil(Math.sqrt(itemsLength));
    let cols = Math.ceil(itemsLength / rows);
    cols = Math.ceil(cols);
    // debugger;
    if (itemsLength < 3) {
      rows = 1;
    }
    if (itemsLength < 4) {
      cols = 2;
    } else if (itemsLength === 5 || itemsLength === 6) {
      cols += 1;
    } else if (itemsLength >= 10 && itemsLength <= 12) {
      cols += 1;
    } else if (itemsLength >= 17 && itemsLength <= 20) {
      cols += 1;
    } else if (itemsLength >= 26 && itemsLength <= 30) {
      cols += 1;
    } else if (itemsLength >= 37 && itemsLength <= 42) {
      cols += 1;
    }

    if (windowWidth < 700) {
      if (itemsLength <= 4) {
        cols = 1;
        rows = itemsLength;
        colWidth = "27vh";
      } else if (itemsLength > 4 && itemsLength <= 6) {
        cols = 1;
        rows = itemsLength;
        colWidth = "18vh";
      } else if (itemsLength > 4) {
        cols = 2;
        rows = Math.ceil(itemsLength / 2);
        colWidth = "17vh";
      }
    } else {
      colWidth = "1fr";
    }

    if (gridElement) {
      gridElement.style.setProperty("--column-width", colWidth);
    }
    return { rows, cols };
  }

  $: {
    if (peerConnections && selfView != null) {
      grid = calculateGrid();
    }
  }

  const handleResize = () => {
    windowWidth = window.innerWidth;
    grid = calculateGrid();
  };

  onMount(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
  });

  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });
</script>

<div class="top">
  <div
    class="video-grid top"
    bind:this={gridElement}
    style="--rows: {grid.rows}; --cols: {grid.cols}"
  >
    <LocalVideoGallery {localVideo} />

    {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
      <PeerMediaGallery {connection} {peerId} {update_screen_sharer} />
    {/each}
  </div>
</div>

<style>
  .video-grid {
    display: grid;
    gap: 10px;
    padding: 10px;
    grid-template-rows: repeat(var(--rows), 1fr);
    grid-template-columns: repeat(var(--cols, 1), var(--column-width, 1fr));
    justify-content: center;
    align-items: center;
    max-height: 77vh;
    aspect-ratio: 4 / 3;
    margin-left: auto;
    margin-right: auto;
  }
</style>
