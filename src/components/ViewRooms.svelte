<script>
  import { onMount } from "svelte";
  import { getAllRooms, joinARoom } from "../api/rooms";
  import { navigate } from "svelte-routing";

  let rooms = [];

  onMount(() => {
    getAllRooms().then((data) => {
      rooms = data;
    });
  });

  const joinRoom = (room) => {
    navigate(`/room/${room}`);
  };
</script>

<main>
  {#each rooms as room}
    <button
      on:click={() => {
        navigate(`/room/${room.id}`);
      }}>{room.name}</button
    >
  {/each}
  {#if rooms.length === 0}
    No rooms have been created...
  {/if}
</main>
