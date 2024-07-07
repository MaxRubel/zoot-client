<script>
  import { Route, Router } from "svelte-routing";
  import ViewRooms from "./components/views/ViewRooms.svelte";
  import NewRoomForm from "./components/forms/NewRoomForm.svelte";
  import NavBar from "./components/menus/NavBar.svelte";
  import RoomHub from "./components/views/RoomHub.svelte";
</script>

<main>
  <NavBar />
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><RoomHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
  </Router>
  <!-- <StoreRender /> -->
</main>

<style>
</style>
