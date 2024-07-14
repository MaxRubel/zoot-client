<script>
  import { onDestroy, onMount } from "svelte";

  let windowWidth = 0;
  let gridElement;
  let grid;

  //Adjust length property to change amount of grid items

  function updateLayout() {
    windowWidth = window.innerWidth;
  }

  // let colWidth = "1fr";

  let items = Array.from({ length: 7 }, (_, i) => `Tile ${i + 1}`);
  function calculateGrid() {
    let colWidth = "1fr";
    let rowHeight = "1fr";
    const itemsLength = items.length;
    let rows = Math.ceil(Math.sqrt(itemsLength));
    let cols = Math.ceil(itemsLength / rows);
    let aspect = 4 / 3;

    cols = Math.ceil(cols);
    if (gridElement) {
      gridElement.style.marginTop = "0px";
    }
    switch (itemsLength) {
      case 1:
        aspect = 4 / 3;
        rowHeight = "80vh";
        break;
    }
    // case 2:
    //   cols = 2;
    //   rows = 1;
    //   aspect = null;
    //   gridElement.style.marginTop = "40px";
    //   if (windowWidth < 810) {
    //     gridElement.style.marginTop = "0px";
    //     aspect = 4 / 3;
    //     cols = 1;
    //     rows = 2;
    //     colWidth = "53vh";
    //   }
    //   break;
    // case 3:
    //   if (windowWidth < 623) {
    //     cols = 1;
    //     rows = 3;
    //     colWidth = "36vh";
    //     aspect = null;
    //   }
    //   break;
    // case 4:
    //   if (windowWidth < 520) {
    //     cols = 1;
    //     rows = 4;
    //     colWidth = "26vh";
    //     aspect = null;
    //   }
    //   break;
    // case 5:
    //   cols = 3;
    //   rows = 2;
    //   aspect = 4 / 2;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 3;
    //     colWidth = "26.5vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // case 6:
    //   cols = 3;
    //   rows = 2;
    //   aspect = 4 / 2;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 3;
    //     colWidth = "26.5vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // case 7:
    //   cols = 3;
    //   rows = 3;
    //   aspect = 4 / 3;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 3;
    //     colWidth = "26.5vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // case 8:
    //   cols = 3;
    //   rows = 3;
    //   aspect = 4 / 3;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 3;
    //     colWidth = "26.5vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // case 8:
    //   cols = 3;
    //   rows = 3;
    //   aspect = 4 / 3;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 3;
    //     colWidth = "26.5vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // case 9:
    //   cols = 3;
    //   rows = 3;
    //   aspect = 4 / 3;
    //   if (windowWidth < 660) {
    //     cols = 2;
    //     rows = 4;
    //     colWidth = "21vh";
    //     aspect = 2 / 3;
    //   }
    //   break;
    // }

    if (items.length === 1) {
      rowHeight = "80vh";
    } else if (items.length === 2) {
      cols = 2;
      rows = 1;
      aspect = null;
      gridElement.style.marginTop = "40px";
      if (windowWidth < 810) {
        gridElement.style.marginTop = "0px";
        aspect = 4 / 3;
        cols = 1;
        rows = 2;
        colWidth = "53vh";
      }
    } else if (items.length === 3) {
      if (windowWidth < 623) {
        cols = 1;
        rows = 3;
        colWidth = "36vh";
        aspect = null;
      }
    } else if (items.length === 4) {
      if (windowWidth < 520) {
        cols = 1;
        rows = 4;
        colWidth = "26vh";
        aspect = null;
      }
    } else if (items.length === 5 || items.length === 6) {
      cols = 3;
      rows = 2;
      aspect = 4 / 2;
      if (windowWidth < 660) {
        cols = 2;
        rows = 3;
        colWidth = "26.5vh";
        aspect = 2 / 3;
      }
    } else {
      cols = 3;
      rows = 3;
      aspect = 4 / 3;
      if (windowWidth < 660) {
        cols = 2;
        rows = 4;
        colWidth = "21vh";
        aspect = 2 / 3;
      }
    }

    if (gridElement) {
      gridElement.style.setProperty("--column-width", colWidth);
      gridElement.style.setProperty("--row-height", rowHeight);
      gridElement.style.setProperty("--aspect", aspect);
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
      if (items.length === 9) {
        items = [];
      }
      items = [...items, `Tile ${items.length + 1}`];
    }, 500);
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
    {windowWidth}
  </div>
</div>

<style>
  .page-layout {
    height: 100vh;
    /* place-content: center; */
  }
  .video-grid {
    /* margin-top: 50%; */
    display: grid;
    gap: 10px;
    padding: 10px;
    grid-template-rows: repeat(var(--rows), var(--row-height, 1fr));
    grid-template-columns: repeat(var(--cols, 1), var(--column-width, 1fr));
    justify-content: center;
    align-items: center;
    max-height: 84vh;
    aspect-ratio: var(--aspect);
    border: 5px solid rgba(255, 94, 0, 0.212);
    /* background-color: rgba(255, 94, 0, 0.144); */
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
