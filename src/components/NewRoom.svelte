<script>
  import { navigate } from "svelte-routing";
  import { clientId } from "../../stores/auth_store";

  let idValue;

  clientId.subscribe((value) => {
    idValue = value;
  });

  const newRoomForm = () => {
    navigate("/rooms/new");
  };

  const viewRooms = () => {
    navigate("/rooms");
  };
</script>

<main>
  <button on:click={newRoomForm}> Create New Room </button>
  <button on:click={viewRooms}>View Available Rooms</button>
</main>

<style>
</style>
