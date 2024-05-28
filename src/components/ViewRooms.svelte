<script>
  import { onMount } from "svelte";
  import { getAllRooms, joinARoom } from "../api/rooms";
  import { v4 as uuidv4 } from "uuid";
  import { navigate } from "svelte-routing";

  let rooms = [];

  onMount(() => {
    getAllRooms().then((data) => {
      rooms = data;
    });
  });

  const joinRoom = (room) => {
    const payload = {
      roomId: room,
      clientId: uuidv4(),
    };
    joinARoom(payload).then(() => {
      navigate(`/room/${room}`);
    });
  };
</script>

<main>
  {#each rooms as room}
    <button
      on:click={() => {
        joinRoom(room);
      }}>{room}</button
    >
  {/each}
  {#if rooms.length === 0}
    No rooms have been created...
  {/if}
</main>
