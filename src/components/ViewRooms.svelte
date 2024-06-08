<script>
  import { navigate } from "svelte-routing";
  import { clientId } from "../../stores/auth_store";

  let rooms = [];
  let myId = null;

  clientId.subscribe((value) => {
    myId = value;
  });

  window.addEventListener("beforeunload", () => {
    ws.send(`7&&${myId}&&`);
    ws.close();
  });

  const createRoom = () => {
    navigate("/rooms/new");
  };

  const ws = new WebSocket("ws://localhost:8080/ws");

  ws.onopen = () => {
    ws.send(`6&&${myId}&&`);
  };

  ws.onmessage = (e) => {
    if (e.data[0] === "7") {
      const [_, data] = e.data.split("&");

      if (data !== "null") {
        rooms = JSON.parse(data);
      }
    }
  };
</script>

<main>
  <div>
    <button on:click={createRoom}> Create Room </button>
  </div>
  {#if rooms.length === 0}
    No rooms are currently active...
  {:else}
    <div>
      <table>
        <thead>
          <tr>
            <th style="width: 70%">Room</th>
            <th>Number of Clients</th>
          </tr>
        </thead>
        <tbody>
          {#each rooms as room}
            <tr>
              <td><a href="/rooms/{room.id}">{room.name}</a></td>
              <td>{room.clients ? room.clients.length : "0"}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</main>

<style>
  a {
    color: black;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  tr:hover {
    background-color: #f5f5f5;
  }
</style>
