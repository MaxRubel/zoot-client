<script>
  import { Route, Router } from "svelte-routing";
  import ViewRooms from "./components/pages/ViewRooms.svelte";
  import NewRoomForm from "./components/forms/NewRoomForm.svelte";
  import NavBar from "./components/menus/NavBar.svelte";
  import RoomHub from "./components/pages/RoomHub.svelte";
  import StoreRender from "./components/utils/StoreRender.svelte";
  import Grid from "./components/utils/grid10ppl.svelte";
  import Grid4ppl from "./components/utils/grid4ppl.svelte";
  import OpenWindow from "./components/utils/openWindow.svelte";
</script>

<main>
  <NavBar />
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><RoomHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
    <Route path="/test"><OpenWindow /></Route>
  </Router>
</main>

<style>
</style>
