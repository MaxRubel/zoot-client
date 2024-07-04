<script>
  import LefttArrow from "../../assets/LefttArrow.svelte";
  import RightArrow from "../../assets/RightArrow.svelte";
  import BottomToolBar from "../menus/BottomToolBar.svelte";

  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 9];

  function scrollLeft() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: -450, behavior: "smooth" });
  }

  function scrollRight() {
    const container = document.querySelector(".scroll-container");
    container.scrollBy({ left: 450, behavior: "smooth" });
  }
</script>

<div class="presenter-view-container">
  <div class="scroll-wrapper">
    <button class="scroll-button left-scroll centered" on:click={scrollLeft}>
      <LefttArrow />
    </button>
    <div class="scroll-container">
      {#each array as num}
        <img src="/relax2.webp" alt="" />
      {/each}
    </div>
    <button class="scroll-button right-scroll centered" on:click={scrollRight}>
      <RightArrow />
    </button>
  </div>
  <div class="speaker-div">
    <img class="speaker-vid" src="/relax1.webp" alt="" />
  </div>
  <BottomToolBar />
</div>

<style>
  .presenter-view-container {
    border: 2px solid rgb(51, 51, 51);
    margin-top: 5px;
  }
  .scroll-wrapper {
    border-bottom: 2px solid rgb(51, 51, 51);
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .scroll-container {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    max-height: 18vh;
    min-height: 125px;
  }

  .scroll-container img {
    flex: 0 0 auto;
    width: 200px;
    height: auto;
    margin-right: 10px;
    aspect-ratio: 4/3;
  }

  .scroll-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid rgb(109, 109, 109);
    padding: 15px 5px;
    cursor: pointer;
    z-index: 10;
  }

  .scroll-button:active {
    border: none;
  }

  .left-scroll {
    left: 0;
  }

  .right-scroll {
    right: 0;
  }

  .speaker-div {
    width: 100%; /* Adjust as needed */
    height: 59vh; /* Adjust as needed */
  }

  .speaker-vid {
    width: 100%;
    height: 100%;
    object-fit: cover; /* This makes the image cover the entire div */
  }
</style>
