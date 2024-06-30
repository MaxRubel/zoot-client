<script>
  import { Route, Router } from "svelte-routing";
  import UserHub from "./components/UserHub.svelte";
  import ViewRooms from "./components/ViewRooms.svelte";
  import NewRoomForm from "./components/NewRoomForm.svelte";
  import NavBar from "./components/NavBar.svelte";
</script>

<main>
  <NavBar />
  <Router>
    <Route path="/"><ViewRooms /></Route>
    <Route path="/rooms/:id"><UserHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
  </Router>
</main>

<style>
</style>
