<script>
  import { peerStates } from "../../stores/media/peerStates";

  $: peerState = JSON.stringify($peerStates, null, 2);
  // $: storeContent = JSON.stringify($peerStates, null, 2);
</script>

<div class="store-content centered">{peerState}</div>

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
