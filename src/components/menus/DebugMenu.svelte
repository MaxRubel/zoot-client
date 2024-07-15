<script>
  export let sendTestMessage;
  export let testConnection;
  export let showPeerConnections;
  export let testMedia;
</script>

<div class="side-menu-container">
  <nav class="side-menu">
    <div class="button-container">
      <button on:click={sendTestMessage}> Ping server </button>
      <button on:click={testConnection}>Connection Details</button>
      <button on:click={testMedia}>Test Media</button>
      <button on:click={showPeerConnections}>Show Peer Connections</button>
    </div>
  </nav>
</div>

<style>
  .side-menu-container {
    display: flex;
    align-items: center;
    margin-left: 46px;
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

  button {
    font-size: 14px;
  }

  .side-menu button {
    color: white;
    border: none;
    padding: 10px;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.5s ease;
    background-color: rgb(24, 59, 90);
    height: 55px;
  }
</style>
