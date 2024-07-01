<script>
  import GearIcon from "../../assets/GearIcon.svelte";

  let isExpanded = false;
  export let sendTestMessage;
  export let testConnection;
  export let showPeerConnections;
  export let testMedia;

  function toggleMenu() {
    isExpanded = !isExpanded;
  }
</script>

<div class="side-menu-container">
  <button id="toggle-menu" class="clear" on:click={toggleMenu}>
    <GearIcon />
  </button>
  <nav
    class="side-menu"
    class:expanded={isExpanded}
    class:collapsed={!isExpanded}
  >
    <div class="button-container">
      <button on:click={sendTestMessage}> Ping server </button>
      <button on:click={testConnection}>Connection Details</button>
      <button on:click={testMedia}>Test Media</button>
      <button on:click={showPeerConnections}>Show Peer Connections</button>
    </div>
  </nav>
</div>

<style>
  .clear {
    display: flex;
    height: 50px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    background-color: transparent;
    color: rgb(255, 255, 255);
  }

  .side-menu-container {
    display: flex;
    align-items: center;
  }

  .side-menu {
    transition: all 0.5s ease;
    width: 100%;
  }

  .button-container {
    display: flex;
    gap: 10px;
    padding: 10px;
    transition: opacity 0.5s ease;
  }

  .side-menu button {
    color: white;
    border: none;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.5s ease;
    background-color: rgb(24, 59, 90);
    height: 55px;
  }

  #toggle-menu {
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
  }

  .collapsed {
    width: 0;
    transition: all ease 1s;
  }

  .expanded {
    width: 200px;
    transition: all ease 1s;
  }

  .expanded .button-container {
    opacity: 1;
  }

  .expanded button {
    opacity: 1;
  }
</style>
