<script>
  import { Route, Router } from "svelte-routing";
  import NewRoom from "./components/NewRoom.svelte";
  import Room from "./components/Room.svelte";
  import Error from "./components/Error.svelte";
</script>

<main>
  <Router>
    <Route path="/"><NewRoom /></Route>
    <Route path="/error404"><Error /></Route>
    <Route path="/room/:Id"><Room /></Route>
  </Router>
</main>

<style>
</style>
