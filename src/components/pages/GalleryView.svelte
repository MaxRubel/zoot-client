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
    let colWidth = "1fr";
    let rowHeight = "1fr";
    let rows = Math.ceil(Math.sqrt(itemsLength));
    let cols = Math.ceil(itemsLength / rows);
    let aspect = 4 / 3;

    switch (itemsLength) {
      case 1:
        aspect = 4 / 3;
        rowHeight = "80vh";
        break;
      case 2:
        cols = 2;
        rows = 1;
        aspect = null;
        if (gridElement) {
          gridElement.style.marginTop = "40px";
        }

        if (windowWidth < 1340) {
          if (gridElement) {
            gridElement.style.marginTop = "0px";
          }
          aspect = 4 / 3;
          cols = 1;
          rows = 2;
          colWidth = "53vh";
        }
        break;
      case 3:
        if (windowWidth < 1000) {
          cols = 1;
          rows = 3;
          colWidth = "36vh";
          aspect = null;
        }
        break;
      case 4:
        if (windowWidth < 750) {
          cols = 1;
          rows = 4;
          colWidth = "26vh";
          aspect = null;
        }
        break;
      case 5:
        cols = 3;
        rows = 2;
        aspect = 4 / 2;
        if (windowWidth < 1100) {
          cols = 2;
          rows = 3;
          colWidth = "26.5vh";
        }
        break;
      case 6:
        cols = 3;
        rows = 2;
        aspect = 4 / 2;
        if (windowWidth < 1100) {
          cols = 2;
          rows = 3;
          colWidth = "26.5vh";
        }
        break;
      case 7:
        cols = 3;
        rows = 3;
        aspect = 4 / 3;
        if (windowWidth < 1110) {
          cols = 2;
          rows = 3;
          colWidth = "26.5vh";
          aspect = 2 / 3;
        }
        break;
      case 8:
        cols = 3;
        rows = 3;
        aspect = 4 / 3;
        if (windowWidth < 1110) {
          cols = 2;
          rows = 3;
          colWidth = "26.5vh";
          aspect = 2 / 3;
        }
        break;
      case 9:
        cols = 3;
        rows = 3;
        aspect = 4 / 3;
        if (windowWidth < 1110) {
          cols = 2;
          rows = 4;
          colWidth = "21vh";
          aspect = 2 / 3;
        }
        break;
    }

    if (gridElement) {
      gridElement.style.setProperty("--column-width", colWidth);
      gridElement.style.setProperty("--row-height", rowHeight);
      gridElement.style.setProperty("--aspect", aspect);
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
    grid-template-rows: repeat(var(--rows), var(--row-height, 1fr));
    grid-template-columns: repeat(var(--cols, 1), var(--column-width, 1fr));
    justify-content: center;
    align-items: center;
    max-height: 87vh;
    aspect-ratio: var(--aspect);
    /* border: 5px solid rgba(255, 94, 0, 0.212); */
    /* background-color: rgba(255, 94, 0, 0.144); */
    margin: auto;
  }
</style>
