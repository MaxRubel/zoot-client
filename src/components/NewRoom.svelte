<script>
  import { v4 as uuidv4 } from "uuid";
  import { createNewRoom, joinARoom } from "../api/rooms";
  import { navigate } from "svelte-routing";

  const makeNewRoom = () => {
    const payload = {
      id: uuidv4(),
      participants: 1,
    };

    createNewRoom(payload).then((response) => {
      console.log(response);
      const payload2 = {
        roomId: response.id,
        clientId: "123123123123",
      };

      joinARoom(payload2).then(() => {
        navigate(`/room/${response.id}`);
      });

      if (response.id === payload.id) {
        navigate(`/room/${payload.id}`, { replace: true });
      }
    });
  };

  const viewRooms = () => {
    navigate("/rooms");
  };
</script>

<main>
  <button on:click={makeNewRoom}> Create New Room </button>
  <button on:click={viewRooms}>View Available Rooms</button>
</main>

<style>
</style>
