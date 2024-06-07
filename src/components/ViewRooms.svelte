<script>
  import { onMount } from "svelte";
  import { getAllRooms, joinARoom } from "../api/rooms";
  import { navigate } from "svelte-routing";

  let rooms = [];

  onMount(() => {
    getAllRooms().then((data) => {
      console.log(data);
      rooms = data;
    });
  });

  const createRoom = () => {
    navigate("/rooms/new");
  };
</script>

<main>
  <div>
    <button on:click={createRoom}> Create Room </button>
  </div>
  {#if rooms.length === 0}
    No rooms have been created...
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
