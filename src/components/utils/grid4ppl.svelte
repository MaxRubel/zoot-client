<script>
  import { onDestroy, onMount } from "svelte";

  let gridElement;
  let windowWidth = 0;
  let items = Array.from({ length: 0 }, (_, i) => `Tile ${i + 1}`); // Adjust the length to simulate different item counts
  let newWindow;
  let grid;

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

  // function setAspectRatio(width, height) {
  //   const aspectRatio = width / height;
  //   const newWidth = window.innerHeight * aspectRatio;
  //   window.resizeTo(newWidth, window.innerHeight);
  // }

  // // Example: Set a 16:9 aspect ratio
  // setAspectRatio(16, 9);

  function calculateGrid() {
    const itemsLength = items.length;
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

    return { rows, cols };
  }

  $: {
    grid = calculateGrid();
    console.log(items);
  }
  let interval;

  const stop = () => {
    clearInterval(interval);
  };

  const start = () => {
    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => {
      items = [...items, `Tile ${items.length + 1}`];
    }, 300);
  };

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);

    onDestroy(() => {
      window.removeEventListener("resize", updateLayout);
      clearInterval(interval);
    });
  });
</script>

<div
  class="video-grid"
  bind:this={gridElement}
  style="--rows: {grid.rows}; --cols: {grid.cols}"
>
  {#each items as item}
    <div class="tile">
      <div class="tile-content">{item}</div>
    </div>
  {/each}
</div>
<button on:click={start}>start</button>
<button on:click={stop}>stop</button>

<style>
  .video-grid {
    display: grid;
    gap: 10px;
    padding: 10px;
    grid-template-rows: repeat(var(--rows), 1fr);
    grid-template-columns: repeat(var(--cols), 1fr);
    justify-content: center;
    align-items: center;
    max-height: 77vh;
    aspect-ratio: 4 / 3;
    background-color: rgba(255, 0, 0, 0.164);
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
