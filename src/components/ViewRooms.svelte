<script>
  import { navigate } from "svelte-routing";
  import { clientId } from "../../stores/auth_store";
  import { onDestroy, onMount } from "svelte";
  import { createAudioContext } from "../../stores/media/audioContext";

  let rooms = [];
  let myId = null;

  clientId.subscribe((value) => {
    myId = value;
  });

  //public:
  // const ws = new WebSocket("wss://zoot-server-tgsls4olia-uc.a.run.app/ws");
  //local:
  const ws = new WebSocket("ws://localhost:8080/ws");

  window.addEventListener("keydown", (e) => {
    if (e.key === "'" && e.ctrlKey) {
      ws.send("8&&&&");
    }
  });

  window.addEventListener("beforeunload", () => {
    ws.send(`7&&${myId}&&`);
    ws.close();
  });

  const createRoom = () => {
    createAudioContext();
    navigate("/rooms/new");
  };

  const goToRoom = (id) => {
    createAudioContext();
    navigate(`/rooms/${id}`);
  };

  ws.onopen = () => {
    ws.send(`6&&${myId}&&`);
  };

  ws.onmessage = (e) => {
    if (e.data[0] === "7") {
      const [_, data] = e.data.split("&");

      if (data !== "null") {
        rooms = Object.values(JSON.parse(data));
      }
    }
  };
</script>

<main>
  <div>
    <button id="gesture" on:click={createRoom}> Create Room </button>
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
              <td>
                <button
                  id="gesture"
                  class="not-button"
                  on:click={() => {
                    goToRoom(room.id);
                  }}
                >
                  {room.name}
                </button>
              </td><td
                >{Object.values(room.clients)
                  ? Object.values(room.clients).length
                  : "0"}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</main>

<style>
  .not-button {
    background-color: transparent;
    color: black;
    border: none;
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
