<script>
  import { Route, Router } from "svelte-routing";
  import NewRoom from "./components/NewRoom.svelte";
  import Room from "./components/UserHub.svelte";
  import Error from "./components/Error.svelte";
  import UserHub from "./components/UserHub.svelte";
  import ViewRooms from "./components/ViewRooms.svelte";
  import NewRoomForm from "./components/NewRoomForm.svelte";
</script>

<main>
  <Router>
    <Route path="/"><NewRoom /></Route>
    <Route path="/rooms"><ViewRooms /></Route>
    <Route path="/room/:id"><UserHub /></Route>
    <Route path="/rooms/new"><NewRoomForm /></Route>
    <!-- <Route path="/error404"><Error /></Route> -->
    <!-- <Route path="/room/:Id"><UserHub /></Route> -->
  </Router>
</main>

<style>
</style>
