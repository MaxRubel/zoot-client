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
    min-width: 350px;
    max-width: 100%;
    height: 80vh;
    display: flex;
    justify-content: center;
    /* align-items: center; */
  }

  button {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    text-decoration: none;
    color: #ffffff;
    background-color: #646cff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    height: 53px;
  }

  button:hover {
    background-color: #535bf2;
  }

  button:focus {
    outline: 2px solid #535bf2;
    outline-offset: 2px;
  }

  button:active {
    background-color: #4347d9;
  }

  .left {
    text-align: left;
  }
</style>
