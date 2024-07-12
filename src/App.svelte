<script>
  import { Route, Router } from "svelte-routing";
  import ViewRooms from "./components/pages/ViewRooms.svelte";
  import NewRoomForm from "./components/forms/NewRoomForm.svelte";
  import NavBar from "./components/menus/NavBar.svelte";
  import RoomHub from "./components/pages/RoomHub.svelte";
  import Grid4ppl from "./components/utils/grid4ppl.svelte";
</script>

<main>
  <NavBar />
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><RoomHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
    <Route path="/test"><Grid4ppl /></Route>
  </Router>
</main>

<style>
</style>
