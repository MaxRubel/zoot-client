<script>
  import { Route, Router } from "svelte-routing";
  import ViewRooms from "./components/pages/ViewRooms.svelte";
  import NewRoomForm from "./components/forms/NewRoomForm.svelte";
  import NavBar from "./components/menus/NavBar.svelte";
  import RoomHub from "./components/pages/RoomHub.svelte";
  import Grid4ppl from "./components/utils/grid4ppl.svelte";
  import { userState } from "../stores/media/userState";
  import { onDestroy } from "svelte";

  let user_state;

  const unsubscribe = userState.subscribe((value) => {
    user_state = value;
  });

  onDestroy(unsubscribe);
</script>

<main>
  {#if !user_state.inRoom}<NavBar />{/if}
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><RoomHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
    <Route path="/test"><Grid4ppl /></Route>
  </Router>
</main>

<style>
</style>
