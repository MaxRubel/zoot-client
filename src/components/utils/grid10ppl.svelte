<script>
  import { onMount } from "svelte";

  let screenWidth;
  let gridElement;

  function updateLayout() {
    screenWidth = window.innerWidth;
    if (screenWidth < 669) {
    }
  }

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  });
</script>

<div class="video-grid" bind:this={gridElement}>
  <div class="tile"><div class="tile-content">Video 1</div></div>
  <div class="tile"><div class="tile-content">Video 2</div></div>
  <div class="tile"><div class="tile-content">Video 3</div></div>
  <div class="tile"><div class="tile-content">Video 4</div></div>
  <!-- <div class="tile"><div class="tile-content">Video 14</div></div>
  <div class="tile"><div class="tile-content">Video 15</div></div>
  <div class="tile"><div class="tile-content">Video 16</div></div>
  <div class="tile"><div class="tile-content">Video 17</div></div>
  <div class="tile"><div class="tile-content">Video 18</div></div> -->
  <!-- <div class="tile"><div class="tile-content">Video 19</div></div>
  <div class="tile"><div class="tile-content">Video 20</div></div> -->
</div>

<style>
  .video-grid {
    --aspect-ratio: 16 / 9;
    --gap: 10px;

    display: grid;
    gap: var(--gap);
    padding: var(--gap);
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    justify-content: center; /* Center the grid */
    align-items: center; /* Center the grid */
  }

  .tile {
    position: relative;
    width: 100%;
    padding-top: calc(100% / (var(--aspect-ratio))); /* Maintain aspect ratio */
  }

  .tile::before {
    content: "";
    display: block;
    /* padding-top: calc(100% / (var(--aspect-ratio))); Maintain aspect ratio */
  }

  .tile-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media screen and (max-width: 708px) {
    .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  @media screen and (max-width: 688px) and (min-width: 570px) {
    .video-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }
</style>
