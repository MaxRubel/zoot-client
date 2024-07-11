<script>
  import { onMount } from "svelte";

  let gridElement;
  let windowWidth = 0;
  let items = Array.from({ length: 20 }, (_, i) => `Video ${i + 1}`); // Adjust the length to simulate different item counts
  let newWindow;

  function openNewWindow() {
    newWindow = window.open("", "New Window", "width=600,height=400");
    if (newWindow) {
      newWindow.document.write(
        "<html><body><h1>Hello from Svelte!</h1></body></html>",
      );
    }
  }

  function updateLayout() {
    windowWidth = window.innerWidth;
    const aspectRatio = 16 / 9;
    const newWidth = window.innerHeight * aspectRatio;
    window.resizeTo(newWidth, window.innerHeight);
  }

  function setAspectRatio(width, height) {
    const aspectRatio = width / height;
    const newWidth = window.innerHeight * aspectRatio;
    window.resizeTo(newWidth, window.innerHeight);
  }

  // Example: Set a 16:9 aspect ratio
  setAspectRatio(16, 9);

  function calculateGrid() {
    const length = items.length;
    const rows = Math.ceil(Math.sqrt(length));
    const cols = Math.ceil(length / rows);
    return { rows, cols };
  }

  $: grid = calculateGrid();

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  });
</script>

<div
  class="video-grid"
  bind:this={gridElement}
  style="--rows: {grid.rows}; --cols: {grid.cols}"
>
  {#each items as item, index}
    <div class="tile">
      <div class="tile-content">{item}</div>
    </div>
  {/each}
  {#each Array(grid.rows * grid.cols - items.length) as _}
    <div class="tile">
      <div class="tile-content empty"></div>
    </div>
  {/each}
</div>

<style>
  .video-grid {
    display: grid;
    gap: 10px;
    padding: 10px;
    grid-template-rows: repeat(var(--rows), 1fr);
    grid-template-columns: repeat(var(--cols), 1fr);
    justify-content: center;
    align-items: center;
    max-height: 87vh;
    background-color: red;
  }

  .tile {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border: 1px solid rgba(224, 255, 255, 0.482);
  }

  .tile-content {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .tile-content.empty {
    background-color: transparent;
    border: none;
  }
</style>
