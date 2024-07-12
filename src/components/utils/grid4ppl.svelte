<script>
  import { onDestroy, onMount } from "svelte";

  let windowWidth = 0;
  let gridElement;
  let grid;

  //Adjust length property to change amount of grid items
  let items = Array.from({ length: 0 }, (_, i) => `Tile ${i + 1}`);

  function updateLayout() {
    windowWidth = window.innerWidth;
  }

  let colWidth = "1fr";

  function calculateGrid() {
    const itemsLength = items.length;
    let rows = Math.ceil(Math.sqrt(itemsLength));
    let cols = Math.ceil(itemsLength / rows);
    cols = Math.ceil(cols);

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
        colWidth = "29vh";
      } else if (itemsLength > 4 && itemsLength <= 6) {
        cols = 1;
        rows = itemsLength;
        colWidth = "19vh";
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
    grid = calculateGrid();
    items = items;
    windowWidth = windowWidth;
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
    }, 400);
  };

  const add1 = () => {
    items = [...items, `Tile ${items.length + 1}`];
  };

  const remove1 = () => {
    if (items.length > 0) {
      const newItems = [...items];
      newItems.pop();
      items = newItems;
    }
  };

  const clear = () => {
    items = [];
  };

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
  });
  onDestroy(() => {
    window.removeEventListener("resize", updateLayout);
    clearInterval(interval);
  });
</script>

<div class="page-layout">
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
  <div class="fixed">
    <button on:click={start}>start</button>
    <button on:click={stop}>stop</button>
    <button on:click={add1}>add 1</button>
    <button on:click={remove1}>remove 1</button>
    <button on:click={clear}>clear</button>
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
    border: 5px solid rgba(255, 94, 0, 0.212);
    background-color: rgba(255, 94, 0, 0.144);
    margin: auto;
  }

  .tile {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
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

  .fixed {
    position: fixed;
    bottom: 30px;
    left: 30px;
  }
</style>
