<script>
  import { Route, Router } from "svelte-routing";
  import UserHub from "./components/views/UserHub.svelte";
  import ViewRooms from "./components/views/ViewRooms.svelte";
  import NewRoomForm from "./components/forms/NewRoomForm.svelte";
  import NavBar from "./components/menus/NavBar.svelte";
  import StoreRender from "./components/StoreRender.svelte";
</script>

<main>
  <NavBar />
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><UserHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
  </Router>
  <!-- <StoreRender /> -->
</main>

<style>
</style>
