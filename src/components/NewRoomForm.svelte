<script>
  import { navigate } from "svelte-routing";
  import { createNewRoom } from "../api/rooms";

  let name = "";

  const handleSubmit = (e) => {
    e.preventDefault();
    createNewRoom({ name }).then((roomId) => {
      navigate(`/room/${roomId}`);
    });
  };
</script>

<main>
  <form on:submit={handleSubmit}>
    <div class="left">Room Name:</div>
    <input type="text" bind:value={name} />
    <button type="submit">Create</button>
  </form>
</main>

<style>
  .left {
    text-align: left;
  }
</style>
