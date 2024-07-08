<script>
  import { peerStates } from "../../stores/media/peerStates";
  import { userState } from "../../stores/media/userState";

  $: peerState = JSON.stringify($peerStates, null, 2);
  $: user_state = JSON.stringify($userState, null, 2);
</script>

<div class="store-content centered">{user_state}</div>

<style>
  .store-content {
    width: 100%;
    min-height: 40px;
    position: fixed;
    bottom: 80px;
    background-color: white;
    color: black;
  }
</style>
