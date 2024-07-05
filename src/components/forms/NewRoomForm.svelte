<script>
  import { navigate } from "svelte-routing";
  import { createNewRoom } from "../../api/rooms";

  let name = "";

  const handleSubmit = (e) => {
    e.preventDefault();
    createNewRoom({ name }).then((roomId) => {
      navigate(`/rooms/${roomId}`);
    });
  };
</script>

<div class="form-container">
  <form on:submit={handleSubmit} class="new-room-form">
    <div class="left">Room Name:</div>
    <input type="text" bind:value={name} />
    <button type="submit">Create</button>
  </form>
</div>

<style>
  .form-container {
    margin-top: 30px;
    width: 50%;
    min-width: 350px;
    max-width: 100%;
  }

  .left {
    text-align: left;
  }
</style>
