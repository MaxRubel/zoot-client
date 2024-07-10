<script>
  import { navigate } from "svelte-routing";
  import { clientId } from "../../../stores/auth_store";
  import { createAudioContext } from "../../../stores/media/audioContext";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  let rooms = [];
  let myId = null;
  let isFetching = true;

  clientId.subscribe((value) => {
    myId = value;
  });

  // const ws = new WebSocket(import.meta.env.VITE_PUBLIC_WS);
  const ws = new WebSocket(import.meta.env.VITE_LOCAL_WS);

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
        isFetching = false;
      }
    }
  };
</script>

{#if !isFetching}
  <div transition:fade={{ duration: 500, delay: 500 }}>
    <div class="view-rooms-container">
      <button on:click={createRoom}> Create Room </button>
      <img src="/angryZoot.png" alt="Angry Zoot mfer" class="zoot" />
      {#if rooms.length === 0}
        <div class="top">No rooms are currently active...</div>
      {:else}
        <div class="top">
          <table>
            <thead>
              <tr>
                <th style="width: 70%">Room</th>
                <th>Clients</th>
              </tr>
            </thead>
            <tbody>
              {#each rooms as room}
                <tr>
                  <td>
                    <button
                      class="not-button"
                      on:click={() => {
                        goToRoom(room.id);
                      }}
                    >
                      {room.name}
                    </button>
                  </td>
                  <td
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
    </div>
  </div>
{/if}

<style>
  .view-rooms-container {
    display: flex;
    align-items: center;
    height: 80vh;
    flex-direction: column;
    font-size: 14px;
  }
  .not-button {
    background-color: transparent;
    color: white;
    border: none;
    padding: 0px;
  }
  .zoot {
    opacity: 50%;
    height: 150px;
    position: absolute;
    bottom: 20px;
    right: 5%;
    transform: rotate(4deg);
    transition: all ease 1s;
    z-index: 0;
    display: none;
  }
  table {
    border-collapse: collapse;
    width: 80vw;
  }

  th,
  td {
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  td {
    padding: 2px 15px;
  }
</style>
